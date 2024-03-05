import request from "../request";
import User from "partipro-shared/src/models/user/user.model";
import Property from "partipro-shared/src/models/property/property.model";
import { IDS } from "partipro-shared/__tests__/setupData";
import Contract from "partipro-shared/src/models/contract/contract.model";
import { PropertyType } from "partipro-shared/src/models/property/property.interface";
import FileApi from "partipro-shared/src/core/apis/file.api";

describe("when GET /api/v1/properties", () => {
  beforeEach(async () => {
    const contract1 = await new Contract({
      plan: IDS.PLAN,
    }).save();
    const user1 = await new User({
      name: "User 1",
      password: "123",
      email: "user1@test.com",
      contract: contract1._id,
    }).save();
    await new Property({
      owner: user1._id,
      contract: user1.contract,
      name: "Property of user 1",
      type: PropertyType.RESIDENTIAL,
      deleted: false,
      address: "There",
    }).save();
    await new Property({
      owner: IDS.USER,
      contract: IDS.CONTRACT,
      name: "Property of mine",
      deleted: false,
      address: "There",
      type: PropertyType.COMMERCIAL,
    }).save();
    await new Property({
      owner: IDS.USER,
      contract: IDS.CONTRACT,
      name: "Property of mine 2",
      address: "There",
      type: PropertyType.RESIDENTIAL,
      deleted: false,
    }).save();
  });
  it("Should status 200 and all the properties related to the user that is requesting", async () => {
    const res = await request("get", "properties");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Property of mine",
        }),
        expect.objectContaining({
          name: "Property of mine 2",
        }),
      ]),
    );
  });

  it("Should status 200 and all the properties related to the user that is requesting with filters", async () => {
    const res = await request("get", "properties", { query: { name: "2" } });

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Property of mine 2",
        }),
      ]),
    );
  });
});

describe("When POST /api/v1/properties", () => {
  beforeEach(async () => {
    FileApi.list = jest.fn().mockReturnValue({
      Contents: [],
    });
    FileApi.delete = jest.fn();
    FileApi.upload = jest.fn();
  });
  test("Should return status 201 and the property when the sent data is correct", async () => {
    const res = await request("post", "properties", {
      data: {
        name: "St. test",
        address: "304 street n. 10",
        city: "Itajaí",
        monthRent: 300,
        squareMeters: 60,
        type: PropertyType.COMMERCIAL,
      },
    });

    expect(res.status).toBe(201);
    expect(res.body.owner).toBeTruthy();
    expect(res.body).toEqual(
      expect.objectContaining({
        name: "St. test",
        address: "304 street n. 10",
        city: "Itajaí",
        type: PropertyType.COMMERCIAL,
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

describe("When PUT /api/v1/properties/:id", () => {
  let property: any;
  beforeEach(async () => {
    property = await new Property({
      owner: IDS.USER,
      contract: IDS.CONTRACT,
      name: "Property of mine",
      address: "There",
      deleted: false,
      type: PropertyType.COMMERCIAL,
    }).save();
  });
  test("Should return status 200 and update the property when the sent data is correct", async () => {
    const res = await request("put", `properties/${property._id}`, {
      data: {
        type: PropertyType.RESIDENTIAL,
      },
    });

    expect(res.status).toBe(200);
    expect(res.body.owner).toBeTruthy();
    expect(res.body).toEqual(
      expect.objectContaining({
        name: "Property of mine",
        address: "There",
        type: PropertyType.RESIDENTIAL,
      }),
    );
  });
});

describe("When DELETE /api/v1/properties/:id", () => {
  let property: any;
  beforeEach(async () => {
    FileApi.list = jest.fn().mockReturnValue({
      Contents: [],
    });
    FileApi.delete = jest.fn();
    property = await new Property({
      owner: IDS.USER,
      contract: IDS.CONTRACT,
      name: "Property of mine",
      address: "There",
      deleted: false,
      type: PropertyType.COMMERCIAL,
    }).save();
  });
  test("Should return status 200 and delete the property when the correct id is sent", async () => {
    const res = await request("delete", `properties/${property._id}`);

    expect(res.status).toBe(200);
    expect(res.body.owner).toBeTruthy();
    expect(res.body).toEqual(
      expect.objectContaining({
        name: "Property of mine",
        address: "There",
        type: PropertyType.COMMERCIAL,
      }),
    );
  });
});
