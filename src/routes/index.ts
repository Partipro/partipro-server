import { Router } from "express";
import Auth from "@shared/middlewares/Auth";

import authenticationRoute from "./authentication.route";
import userRoute from "./user.route";
import propertyRoute from "./property.route";
import renterRoute from "./renter.route";
import propertyContractRoute from "./property-contract.route";
import publicRoute from "./public";

const router = Router({ mergeParams: true });

router.use(publicRoute);
router.use(authenticationRoute);
router.use(Auth, userRoute);
router.use(Auth, propertyRoute);
router.use(Auth, renterRoute);
router.use(Auth, propertyContractRoute);

export default router;
