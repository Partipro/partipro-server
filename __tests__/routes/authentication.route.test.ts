import { agent as request } from "supertest";

import app from "../../src/app";
import User from "partipro-shared/src/models/user/user.model";

describe("When /api/v1/auth/register", () => {
  test("Should return status 201 and token when trying to register a user with correct information", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "test@jest.com",
      password: "123",
      name: "Jest Test",
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();

    const user = await User.findOne({ email: "test@jest.com" });

    const isMatch = user ? await user.comparePassword("123") : false;

    expect(isMatch).toBeTruthy();
  });

  test("Should return status 400 when trying to register a user with a already existent email", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "user@jest.com",
      password: "123",
      name: "Jest Test",
    });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe("Este email já existe");
  });

  test("Should return status 400 when trying to register a user without providing a email", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      password: "123",
      name: "Jest Test",
    });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('"email" is required');
  });
});
