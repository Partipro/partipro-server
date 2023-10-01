import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/healthcheck", (_request: Request, response: Response) => {
  response.status(200).send("Im Healthy");
});
export default app;
