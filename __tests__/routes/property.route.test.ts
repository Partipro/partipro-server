import request from "../request";

describe("When POST /api/v1/property", () => {
  test("Should return status 201 and the property when the sent data is correct", async () => {
    const res = await request("post", "properties", {
      data: {
        name: "St. test",
        address: "304 street n. 10",
        city: "Itajaí",
        monthRent: 300,
        squareMeters: 60,
      },
    });

    expect(res.status).toBe(201);
    expect(res.body.owner).toBeTruthy();
    expect(res.body).toEqual(
      expect.objectContaining({
        name: "St. test",
        address: "304 street n. 10",
        city: "Itajaí",
        monthRent: 300,
        squareMeters: 60,
      }),
    );
  });

  test("Should return status 400 and not save the data when it is not correct", async () => {
    const res = await request("post", "properties", {
      data: {
        address: "304 street n. 10",
        squareMeters: 60,
      },
    });

    expect(res.status).toBe(400);
  });
});
