import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

import router from "./routes";
import ErrorHandler from "@shared/middlewares/ErrorHandler";

const app: Application = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  "/api/v1",
  cors({
    credentials: true,
    origin: true,
  }),
  router,
);

app.use(ErrorHandler);

app.get("/healthcheck", (_request: Request, response: Response) => {
  response.status(200).send("Im Healthy");
});
export default app;
