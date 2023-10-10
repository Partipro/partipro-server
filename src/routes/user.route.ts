import express from "express";

import WrapAsync from "partipro-shared/src/middlewares/WrapAsync";
import { httpStatusCodes } from "partipro-shared/src/constants";
import userController from "../controllers/user.controller";
import NotFoundError from "../../shared/partipro-shared/src/errors/NotFoundError";

const userRoute = express.Router();

userRoute.get(
  "/users",
  WrapAsync(async (req, res) => {
    const user = await userController.findById(req.user.id, {});

    if (!user) {
      throw new NotFoundError("user_not_found", "Usuário não encontrado");
    }

    res.status(httpStatusCodes.OK).json(user);
  }),
);

export default userRoute;
