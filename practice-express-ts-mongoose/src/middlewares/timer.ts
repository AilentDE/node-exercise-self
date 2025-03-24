import { Router } from "express";

const router = Router();

router.use((req, res, next) => {
  const startTime = Date.now();
  const nowDateTime = new Date();
  console.info(`[${nowDateTime.toISOString()}] - ${req.method} - ${req.url}`);

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    console.info(`[Request duration] - ${duration}ms`);
  });

  next();
});

export default router;
