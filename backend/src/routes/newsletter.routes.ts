import { Router } from "express";
import { subscribeNewsletter } from "../controllers/subscriber.controller";

const router = Router();

router.post("/subscribe", subscribeNewsletter);

export default router;
