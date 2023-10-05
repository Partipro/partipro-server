import Joi from "joi";
import express from "express";
import jwt from "jsonwebtoken";
import dayjs from "dayjs";

import WrapAsync from "partipro-shared/src/middlewares/WrapAsync";

import BodyHandler from "partipro-shared/src/middlewares/BodyHandler";
import { httpStatusCodes } from "partipro-shared/src/constants";
import UserService from "../services/user.service";

const authenticationRoute = express.Router();

const SECRET_KEY = process.env.SECRET_KEY as string;

authenticationRoute.post(
  "/auth/register",
  BodyHandler(
    Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      name: Joi.string().required(),
    }),
  ),
  WrapAsync(async (req, res) => {
    const user = await UserService.register(req.body);
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
      },
      SECRET_KEY,
      {
        expiresIn: "10 days",
      },
    );
    res
      .cookie("ccToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: dayjs().add(3, "days").toDate(),
      })
      .status(httpStatusCodes.CREATED)
      .json({
        id: user._id,
        token,
      });
  }),
);

export default authenticationRoute;
