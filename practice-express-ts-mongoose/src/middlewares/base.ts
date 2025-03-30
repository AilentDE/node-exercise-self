import { Router, json, urlencoded } from "express";

const router = Router();

router.use(json());
router.use(urlencoded({ extended: true }));

export default router;
