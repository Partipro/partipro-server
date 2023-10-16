import { agent as request } from "supertest";

import app from "../src/app";

export default async (
  method: "post" | "get" | "put" | "delete",
  endpoint: string,
  { data = {} }: { data?: any } = {},
) => {
  const loginResponse = await request(app).post("/api/v1/auth").send({
    email: "user@jest.com",
    password: "123",
  });

  return request(app)[method](`/api/v1/${endpoint}`).set("Cookie", `ccToken=${loginResponse.body.token}`).send(data);
};
