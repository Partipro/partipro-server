import express from "express";
import WrapAsync from "@shared/middlewares/WrapAsync";

const publicRoute = express.Router();

publicRoute.post(
  "/public/clicksign",
  WrapAsync(async (req, res) => {
    console.log("befe723e2c9c3a125a7876a7ba1abbdf");
    console.log(req.body);

    res.status(200).json({ message: "ok" });
  }),
);

export default publicRoute;
