import { agent as request } from "supertest";

import app from "../../src/app";
import User from "partipro-shared/src/models/user/user.model";
import Plan from "partipro-shared/src/models/plan/plan.model";
import { PlanHsSku } from "partipro-shared/src/models/plan/plan.interface";

describe("When POST /api/v1/auth/register", () => {
  test("Should return status 201 and token when trying to register a user with correct information", async () => {
    await new Plan({
      name: "grátis",
      hs_sku: PlanHsSku.FREE,
      price: 0,
    }).save();

    const res = await request(app).post("/api/v1/auth/register").send({
      email: "test@jest.com",
      password: "123",
      name: "Jest Test",
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();

    const user = await User.findOne({ email: "test@jest.com" }).select("+password");

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

  test("Should return status 400 when trying to register a user with invalid plan_hs_sku", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      password: "123",
      email: "sjdno@pdif.com",
      name: "Jest Test",
      plan_hs_sku: "NOT_VALID",
    });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('"plan_hs_sku" must be one of [FREE, STANDARD]');
  });
});

describe("When POST /api/v1/auth", () => {
  beforeEach(async () => {
    await request(app).post("/api/v1/auth/register").send({
      email: "test@jest.com",
      password: "123",
      name: "Jest Test",
    });
  });
  test("Should return status 403 when trying to login a user with wrong password", async () => {
    const res = await request(app).post("/api/v1/auth").send({
      email: "test@jest.com",
      password: "125633",
    });
    expect(res.body.error.message).toBe("Senha incorreta.");
    expect(res.status).toBe(403);
  });

  test("Should return status 200 and token when trying to login with correct credentials", async () => {
    const res = await request(app).post("/api/v1/auth").send({
      email: "test@jest.com",
      password: "123",
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  test("Should return status 400 when trying to login a email not existent", async () => {
    const res = await request(app).post("/api/v1/auth").send({
      email: "not@existing.com",
      password: "123",
    });
    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe("Não foi possível encontrar este usuário.");
  });

  test("Should return status 400 when trying to login without providing a email", async () => {
    const res = await request(app).post("/api/v1/auth").send({
      password: "123",
    });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('"email" is required');
  });
});
