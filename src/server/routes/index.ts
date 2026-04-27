import { Router, type IRouter } from "express";
import healthRouter from "./health";
import preciosRouter from "./precios";
import cotizacionRouter from "./cotizacion";
import googleReviewsRouter from "./googleReviews";
import adminAuthRouter from "./adminauth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(preciosRouter);
router.use(cotizacionRouter);
router.use(googleReviewsRouter);
router.use(adminAuthRouter);

export default router;
