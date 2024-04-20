import request from "../request";
import Contract from "partipro-shared/src/models/contract/contract.model";
import { IDS } from "partipro-shared/__tests__/setupData";
import User from "../../shared/partipro-shared/src/models/user/user.model";

describe("when GET /api/v1/renters", () => {
  beforeEach(async () => {
    const anotherUserContract = await new Contract({
      socialReason: "Another guy",
    }).save();
    await new User({
      name: "Renter of user 1",
      email: "renterofmine1@test.com",
      role: "RENTER",
      contract: anotherUserContract._id,
    }).save();
    await new User({
      name: "Renter of mine",
      email: "renterofmine@test.com",
      role: "RENTER",
      contract: IDS.CONTRACT,
    }).save();
    await new User({
      name: "Renter of mine 2",
      email: "renterofmine2@test.com",
      role: "RENTER",
      contract: IDS.CONTRACT,
    }).save();
  });
  it("Should status 200 and all the renters related to the user that is requesting", async () => {
    const res = await request("get", "renters");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Renter of mine",
        }),
        expect.objectContaining({
          name: "Renter of mine 2",
        }),
      ]),
    );
  });

  it("Should status 200 and all the renters related to the user that is requesting with filters", async () => {
    const res = await request("get", "renters", { query: { name: "2" } });

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Renter of mine 2",
        }),
      ]),
    );
  });
});

describe("When POST /api/v1/renters", () => {
  test("Should return status 201 and the renter when the sent data is correct", async () => {
    const res = await request("post", "renters", {
      data: {
        name: "St. test",
        password: "123456",
        email: "sttest@test.com",
      },
    });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(
      expect.objectContaining({
        name: "St. test",
        role: "RENTER",
      }),
    );
  });

  test("Should return status 400 and not save the data when it is not correct", async () => {
    const res = await request("post", "renters", {
      data: {
        business: "clothes",
        password: "123456",
        email: "clothes@test.com",
      },
    });

    expect(res.status).toBe(400);
  });
});

describe("When PUT /api/v1/renters/:id", () => {
  let renter: any;
  beforeEach(async () => {
    renter = await new User({
      name: "Renter of mine",
      email: "Renterfmine@test.com",
      role: "RENTER",
      contract: IDS.CONTRACT,
    }).save();
  });
  test("Should return status 200 and update the renter when the sent data is correct", async () => {
    const res = await request("put", `renters/${renter._id}`, {
      data: {
        business: "food",
      },
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        name: "Renter of mine",
        business: "food",
      }),
    );
  });
});

describe("When DELETE /api/v1/renters/:id", () => {
  let renter: any;
  beforeEach(async () => {
    renter = await new User({
      name: "Renter of mine",
      email: "sg@test.com",
      role: "RENTER",
      contract: IDS.CONTRACT,
    }).save();
  });
  test("Should return status 200 and delete the renter when the correct id is sent", async () => {
    const res = await request("delete", `renters/${renter._id}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        name: "Renter of mine",
      }),
    );
  });
});
