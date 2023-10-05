import BadRequestError from "partipro-shared/src/errors/BadRequestError";
import AuthenticationService from "partipro-shared/src/services/authentication.service";
import { IUser } from "partipro-shared/src/models/user/user.interface";
import UserRepository from "partipro-shared/src/repositories/user.repository";

class AuthenticationController extends AuthenticationService {
  private authenticationService: AuthenticationService;

  constructor(authService: AuthenticationService) {
    super(authService);
    this.authenticationService = authService;
  }

  async register(props: IUser): Promise<IUser> {
    const user = await this.authenticationService.findOne({
      filters: {
        email: props.email,
      },
    });

    if (user) {
      throw new BadRequestError("user_found", "Este email já existe");
    }

    return this.authenticationService.insert(props);
  }

  async login({ email, password }: { email: string; password: string }): Promise<IUser> {
    const user = await this.authenticationService.findOne({
      filters: {
        email,
      },
    });
    return user;
  }
}

const authenticationService = new AuthenticationService(new UserRepository());

export default new AuthenticationController(authenticationService);
