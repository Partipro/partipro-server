import { IUser } from "partipro-shared/src/models/user/user.interface";
import UserRepository from "partipro-shared/src/repositories/user.repository";
import AuthenticationService from "partipro-shared/src/services/authentication.service";

import NotFoundError from "partipro-shared/src/errors/NotFoundError";
import BadRequestError from "partipro-shared/src/errors/BadRequestError";
import UnauthorizedError from "partipro-shared/src/errors/UnauthorizedError";

class AuthenticationController extends AuthenticationService {
  private authenticationService: AuthenticationService;

  constructor(authService: AuthenticationService) {
    super(authService);
    this.authenticationService = authService;
  }

  async register(props: IUser): Promise<string> {
    const user = await this.authenticationService.findOne({
      filters: {
        email: props.email,
      },
    });

    if (user) {
      throw new BadRequestError("user_found", "Este email já existe");
    }

    const insertedUser = await this.authenticationService.insert(props);

    if (!insertedUser) {
      throw new BadRequestError("error_creating_user", "Erro ao criar usuário.");
    }

    return this.authenticationService.generateToken(insertedUser._id);
  }

  async login({ email, password }: { email: string; password: string }): Promise<string> {
    const user = await this.authenticationService.findOne({
      filters: {
        email,
      },
    });

    if (!user) {
      throw new NotFoundError("user_not_found", "Não foi possível encontrar este usuário.");
    }

    const isPasswordMatch = await this.authenticationService.comparePassword(password, user.password);

    if (isPasswordMatch) {
      return this.authenticationService.generateToken(user._id);
    } else {
      throw new UnauthorizedError("incorrect_password", "Senha incorreta.");
    }
  }
}

const authenticationService = new AuthenticationService(new UserRepository());

export default new AuthenticationController(authenticationService);
