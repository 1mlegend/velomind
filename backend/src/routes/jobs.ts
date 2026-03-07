import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/:address", async (req: Request, res: Response) => {
  const address = req.params.address as string;
  const jobs = await prisma.job.findMany({
    where: { walletAddress: address.toLowerCase() },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { proof: true },
  });
  res.json(jobs);
});

export default router;
