import mongoose from "mongoose";

import { IUser } from "partipro-shared/src/models/user/user.interface";
import UserRepository from "partipro-shared/src/repositories/user.repository";
import AuthenticationService from "partipro-shared/src/services/authentication.service";
import ContractService from "partipro-shared/src/services/contract.service";

import PlanService from "partipro-shared/src/services/plan.service";
import NotFoundError from "partipro-shared/src/errors/NotFoundError";
import BadRequestError from "partipro-shared/src/errors/BadRequestError";
import UnauthorizedError from "partipro-shared/src/errors/UnauthorizedError";
import { PlanHsSku } from "partipro-shared/src/models/plan/plan.interface";

class AuthenticationController extends AuthenticationService {
  private authenticationService: AuthenticationService;
  private contractService: ContractService;
  private planService: PlanService;

  constructor(authService: AuthenticationService, contractService: ContractService, planService: PlanService) {
    super(authService);
    this.authenticationService = authService;
    this.contractService = contractService;
    this.planService = planService;
  }

  async register(
    props: IUser & { plan_hs_sku: PlanHsSku },
    { session }: { session: mongoose.mongo.ClientSession },
  ): Promise<string> {
    const user = await this.authenticationService.findOne({
      filters: {
        email: props.email,
      },
    });

    if (user) {
      throw new BadRequestError("user_found", "Este email já existe");
    }

    const plan = await this.planService.findOne({
      filters: {
        hs_sku: props.plan_hs_sku,
      },
    });

    if (!plan) {
      throw new BadRequestError("plan_not_found", "Plano não encontrado");
    }

    const contract = await this.contractService.insert(
      {
        socialReason: `Empresa de ${props.email}`,
        plan: plan._id,
      },
      { session },
    );

    if (1 + 1 === 2) {
      throw new BadRequestError("should_rollback", "should rollback contract");
    }

    const insertedUser = await this.authenticationService.insert(
      {
        ...props,
        ...(contract?._id && { contract: contract._id }),
      },
      { session },
    );

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
const contractService = new ContractService();
const planService = new PlanService();

export default new AuthenticationController(authenticationService, contractService, planService);
