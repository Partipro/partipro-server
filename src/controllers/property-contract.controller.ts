import { randomUUID } from "crypto";

import { PropertyContractService as Service } from "@shared/services/property-contract.service";
import BadRequestError from "@shared/errors/BadRequestError";
import FileApi from "@shared/core/apis/file.api";
import { IPropertyContract, PropertyContractStatus } from "@shared/models/propertyContract/propertyContract.interface";
import { clicksignEnvelopApi } from "@shared/core/apis/clicksign.api";
import RenterController from "./renter.controller";

class PropertyContractController extends Service {
  async insert({ document, ...props }: IPropertyContract & { document: Express.Multer.File }) {
    const insertedContract = await super.insert({ ...props, status: PropertyContractStatus.AWAITING_SIGN });

    if (!insertedContract) {
      throw new BadRequestError("unable_to_create_property-document", "Não foi possível criar este contrato");
    }

    const renter = await RenterController.findById(insertedContract.renter as string);

    if (!renter) {
      throw new BadRequestError("renter_not_found", "Locatário não encontrado");
    }

    const filePath = `property-document/${insertedContract._id}/${randomUUID()}.${document.originalname
      .split(".")
      .pop()}`;
    await FileApi.upload({ key: filePath, data: document.buffer });

    const clicksignResponse = await clicksignEnvelopApi.create({
      name: document.originalname,
      fileBuffer: document.buffer,
      signerEmail: renter.email,
    });

    await super.update(insertedContract._id, {
      props: {
        document: filePath,
        clicksignEnvelopeId: clicksignResponse.envelopeId,
      },
    });

    await RenterController.update(renter._id, {
      props: {
        clicksignSignerId: clicksignResponse.signerId,
      },
    });

    return (await super.findById(insertedContract._id)) as IPropertyContract;
  }
}

export default new PropertyContractController();
