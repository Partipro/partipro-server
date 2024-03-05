import mongoose from "mongoose";

import { IUser } from "@shared/models/user/user.interface";
import { AuthenticationService as Service } from "@shared/services/authentication.service";
import ContractService from "@shared/services/contract.service";

import PlanService from "@shared/services/plan.service";
import NotFoundError from "@shared/errors/NotFoundError";
import BadRequestError from "@shared/errors/BadRequestError";
import UnauthorizedError from "@shared/errors/UnauthorizedError";
import { PlanHsSku } from "@shared/models/plan/plan.interface";

class AuthenticationController extends Service {
  async register(
    props: IUser & { plan_hs_sku: PlanHsSku },
    { session }: { session: mongoose.mongo.ClientSession },
  ): Promise<string> {
    const user = await super.findOne({
      filters: {
        email: props.email,
      },
    });

    if (user) {
      throw new BadRequestError("user_found", "Este email já existe");
    }

    const plan = await PlanService.findOne({
      filters: {
        hs_sku: props.plan_hs_sku,
      },
    });

    if (!plan) {
      throw new BadRequestError("plan_not_found", "Plano não encontrado");
    }

    const contract = await ContractService.insert(
      {
        socialReason: `Empresa de ${props.email}`,
        plan: plan._id,
      },
      { session },
    );

    const insertedUser = await super.insert(
      {
        ...props,
        ...(contract?._id && { contract: contract._id }),
      },
      { session },
    );

    if (!insertedUser) {
      throw new BadRequestError("error_creating_user", "Erro ao criar usuário.");
    }

    return super.generateToken(insertedUser._id, { session });
  }

  async login({ email, password }: { email: string; password: string }): Promise<string> {
    const user = await super.findOne({
      filters: {
        email,
      },
      select: "+password",
    });

    if (!user) {
      throw new NotFoundError("user_not_found", "Não foi possível encontrar este usuário.");
    }

    const isPasswordMatch = await super.comparePassword(password, user.password);

    if (isPasswordMatch) {
      return super.generateToken(user._id);
    } else {
      throw new UnauthorizedError("incorrect_password", "Senha incorreta.");
    }
  }
}

export default new AuthenticationController();
