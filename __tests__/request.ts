import { agent as request } from "supertest";

import app from "../src/app";

export default async (method: "post" | "get" | "put" | "delete", endpoint: string) => {
  const loginResponse = await request(app).post("/api/v1/auth/register").send({
    email: "mocked@user.com",
    password: "123",
    name: "Jest Test",
  });

  return request(app)[method](`/api/v1/${endpoint}`).set("Cookie", `ccToken=${loginResponse.body.token}`);
};
