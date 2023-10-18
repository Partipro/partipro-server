import { randomUUID } from "crypto";
import PropertyService from "partipro-shared/src/services/property.service";
import { IProperty } from "partipro-shared/src/models/property/property.interface";
import BadRequestError from "partipro-shared/src/errors/BadRequestError";
import FileApi from "partipro-shared/src/core/apis/file.api";

class PropertyController extends PropertyService {
  private propertyService: PropertyService;
  constructor(propertyService: PropertyService) {
    super();
    this.propertyService = propertyService;
  }

  async insert({ file, ...props }: IProperty & { file?: Express.Multer.File }) {
    const insertedProperty = await this.propertyService.insert(props);

    if (!insertedProperty) {
      throw new BadRequestError("unable_to_create_property", "Não foi possível criar esta propriedade");
    }

    const folder = await FileApi.list({ path: `property/${insertedProperty._id}` });
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

      await this.propertyService.update(insertedProperty._id, {
        props: {
          image: filePath,
        },
      });
    }

    return (await this.propertyService.findById(insertedProperty._id)) as IProperty;
  }
}

export default new PropertyController(new PropertyService());
