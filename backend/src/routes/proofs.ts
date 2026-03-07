import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/:jobId", async (req: Request, res: Response) => {
  const jobId = req.params.jobId as string;
  const proof = await prisma.proof.findUnique({
    where: { jobId },
    include: { job: true },
  });
  if (!proof) {
    res.status(404).json({ error: "Proof not found" });
    return;
  }
  res.json(proof);
});

router.post("/confirm", async (req: Request, res: Response) => {
  try {
    const { jobId, onChainTxHash, inputHash, outputHash } = req.body;
    const proof = await prisma.proof.upsert({
      where: { jobId },
      create: {
        jobId,
        inputHash,
        outputHash,
        onChainTxHash,
        verified: true,
      },
      update: { onChainTxHash, verified: true },
    });
    await prisma.job.update({
      where: { id: jobId },
      data: { proofTxHash: onChainTxHash, status: "verified" },
    });
    res.json(proof);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
