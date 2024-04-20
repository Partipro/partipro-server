import { randomUUID } from "crypto";

import { PropertyContractService as Service } from "@shared/services/property-contract.service";
import BadRequestError from "@shared/errors/BadRequestError";
import FileApi from "@shared/core/apis/file.api";
import { IPropertyContract, PropertyContractStatus } from "@shared/models/propertyContract/propertyContract.interface";

class PropertyContractController extends Service {
  async insert({ document, ...props }: IPropertyContract & { document?: Express.Multer.File }) {
    const insertedContract = await super.insert({ ...props, status: PropertyContractStatus.AWAITING_SIGN });

    if (!insertedContract) {
      throw new BadRequestError("unable_to_create_property-document", "Não foi possível criar este contrato");
    }

    if (document) {
      const filePath = `property-document/${insertedContract._id}/${randomUUID()}.${document.originalname
        .split(".")
        .pop()}`;
      await FileApi.upload({ key: filePath, data: document.buffer });

      await super.update(insertedContract._id, {
        props: {
          document: filePath,
        },
      });
    }

    return (await super.findById(insertedContract._id)) as IPropertyContract;
  }
}

export default new PropertyContractController();
