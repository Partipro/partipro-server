import { IUser } from "partipro-shared/src/models/user/user.interface";
import BadRequestError from "partipro-shared/src/errors/BadRequestError";

import UserService from "partipro-shared/src/services/user.service";

export default Object.assign({}, UserService, {
  register: async (props: IUser) => {
    const user = await UserService.findOne({
      filters: {
        email: props.email,
      },
    });

    if (user) {
      throw new BadRequestError("user_found", "Este email já existe");
    }

    return UserService.insert(props);
  },
});
