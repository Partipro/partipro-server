import { agent as agentRequest } from "supertest";

import request from "../request";
import app from "../../src/app";

describe("When GET /api/v1/users", () => {
  test("Should return status 200 and the user when authenticated", async () => {
    const res = await request("get", "users", {});

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        name: "Jest Test",
        email: "mocked@user.com",
      }),
    );
  });

  test("Should return status 401 and the error message when not authenticated", async () => {
    const res = await agentRequest(app).get("/api/v1/users");

    expect(res.status).toBe(403);
    expect(res.body.error.message).toBe("Invalid Token");
  });
});
