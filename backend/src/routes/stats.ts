import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/:address", async (req: Request, res: Response) => {
  const address = (req.params.address as string).toLowerCase();
  const [total, verified] = await Promise.all([
    prisma.job.count({ where: { walletAddress: address } }),
    prisma.job.count({ where: { walletAddress: address, status: "verified" } }),
  ]);
  res.json({
    totalInferences: total,
    verifiedProofs: verified,
    verificationRate: total > 0 ? ((verified / total) * 100).toFixed(1) : "0",
  });
});

export default router;
