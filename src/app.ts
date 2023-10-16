import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

import router from "./routes";
import ErrorHandler from "partipro-shared/src/middlewares/ErrorHandler";

const app: Application = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  "/api/v1",
  cors({
    credentials: true,
    origin: ["http://localhost:5173"],
  }),
  router,
);

app.use(ErrorHandler);

app.get("/healthcheck", (_request: Request, response: Response) => {
  response.status(200).send("Im Healthy");
});
export default app;
