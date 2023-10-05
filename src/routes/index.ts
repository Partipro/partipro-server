import { Router } from "express";
import Auth from "partipro-shared/src/middlewares/Auth";

import authenticationRoute from "./authentication.route";

const router = Router({ mergeParams: true });

router.use("/", authenticationRoute);

export default router;
