import { Router } from "express";
import Auth from "partipro-shared/src/middlewares/Auth";

import authenticationRoute from "./authentication.route";
import userRoute from "./user.route";
import propertyRoute from "./property.route";

const router = Router({ mergeParams: true });

router.use(authenticationRoute);
router.use(Auth, userRoute);
router.use(Auth, propertyRoute);

export default router;
