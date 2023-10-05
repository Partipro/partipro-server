import { agent as request } from "supertest";

import app from "../src/app";

describe("Test app.ts", () => {
  test("Catch-all route", async () => {
    const res = await request(app).get("/healthcheck");
    expect(res.text).toEqual("Im Healthy");
  });
});
