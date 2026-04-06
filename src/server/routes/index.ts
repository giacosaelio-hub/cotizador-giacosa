import { Router, type IRouter } from "express";
import healthRouter from "./health";
import preciosRouter from "./precios";
import cotizacionRouter from "./cotizacion";
import googleReviewsRouter from "./googleReviews";

const router: IRouter = Router();

router.use(healthRouter);
router.use(preciosRouter);
router.use(cotizacionRouter);
router.use(googleReviewsRouter);

export default router;
