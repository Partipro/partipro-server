import { Router } from "express";
import Auth from "@shared/middlewares/Auth";

import authenticationRoute from "./authentication.route";
import userRoute from "./user.route";
import propertyRoute from "./property.route";
import renterRoute from "./renter.route";

const router = Router({ mergeParams: true });

router.use(authenticationRoute);
router.use(Auth, userRoute);
router.use(Auth, propertyRoute);
router.use(Auth, renterRoute);

export default router;
