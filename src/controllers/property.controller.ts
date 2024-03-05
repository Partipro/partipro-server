import { randomUUID } from "crypto";
import { PropertyService as Service } from "@shared/services/property.service";
import { IProperty } from "@shared/models/property/property.interface";
import BadRequestError from "@shared/errors/BadRequestError";
import FileApi from "@shared/core/apis/file.api";

class PropertyController extends Service {
  async insert({ file, ...props }: IProperty & { file?: Express.Multer.File }) {
    const insertedProperty = await super.insert(props);

    if (!insertedProperty) {
      throw new BadRequestError("unable_to_create_property", "Não foi possível criar esta propriedade");
    }

    const folder = await FileApi.list({ path: `property/${insertedProperty._id.toString()}` });
    if (folder && folder.Contents?.length) {
      folder.Contents.forEach(async (folderFile) => {
        if (folderFile.Key) {
          await FileApi.delete({ key: folderFile.Key });
        }
      });
    }

    if (file) {
      const filePath = `property/${insertedProperty._id}/${randomUUID()}.${file.originalname.split(".").pop()}`;
      await FileApi.upload({ key: filePath, data: file.buffer });

      await super.update(insertedProperty._id, {
        props: {
          image: filePath,
        },
      });
    }

    return (await super.findById(insertedProperty._id)) as IProperty;
  }

  async update(id: string, { file, props }: { props: IProperty; file?: Express.Multer.File }) {
    const property = await super.findById(id);

    if (!property) {
      throw new BadRequestError("unable_to_create_property", "Não foi possível criar esta propriedade");
    }

    let filePath = "";
    if (file) {
      const folder = await FileApi.list({ path: `property/${property._id.toString()}` });
      if (folder && folder.Contents?.length) {
        folder.Contents.forEach(async (folderFile) => {
          if (folderFile.Key) {
            await FileApi.delete({ key: folderFile.Key });
          }
        });
      }

      filePath = `property/${property._id}/${randomUUID()}.${file.originalname.split(".").pop()}`;
      await FileApi.upload({ key: filePath, data: file.buffer });
    }

    await super.update(property._id, {
      props: {
        ...props,
        ...(filePath && { image: filePath }),
      },
    });

    return (await super.findById(property._id)) as IProperty;
  }

  async delete(id: string) {
    const property = await super.findById(id);

    if (!property) {
      throw new BadRequestError("unable_to_create_property", "Não foi possível criar esta propriedade");
    }

    const folder = await FileApi.list({ path: `property/${property._id.toString()}` });
    if (folder && folder.Contents?.length) {
      folder.Contents.forEach(async (folderFile) => {
        if (folderFile.Key) {
          await FileApi.delete({ key: folderFile.Key });
        }
      });
    }

    return super.delete(property._id);
  }
}

export default new PropertyController();
