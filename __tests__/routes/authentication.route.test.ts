import { agent as request } from "supertest";

import app from "../../src/app";

describe("When /api/v1/auth/register", () => {
  test("Should return status 200 and token when trying to register a user with correct information", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "test@jest.com",
      password: "123",
      name: "Jest Test",
    });
    expect(res.error).toBe("");
    expect(res.status).toBe(201);
  });
});
