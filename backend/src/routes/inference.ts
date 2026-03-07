import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { runInference } from "../services/inference";
import { generateJobId, hashInput, hashOutput, decryptPrompt, encryptResponse } from "../services/crypto";

const router = Router();
const prisma = new PrismaClient();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { encryptedPrompt, model, walletAddress, encryptionKey } = req.body;

    if (!encryptedPrompt || !model || !walletAddress || !encryptionKey) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const prompt = decryptPrompt(encryptedPrompt, encryptionKey);
    const jobId = generateJobId();
    const inputHash = hashInput(prompt);

    await prisma.job.create({
      data: {
        walletAddress: walletAddress.toLowerCase(),
        model,
        inputHash,
        outputHash: "",
        status: "processing",
      },
    });

    const output = await runInference(prompt, model);
    const outputHash = hashOutput(output);
    const encryptedResponse = encryptResponse(output, encryptionKey);

    await prisma.job.updateMany({
      where: { walletAddress: walletAddress.toLowerCase(), status: "processing", inputHash },
      data: { outputHash, status: "pending", response: encryptedResponse },
    });

    res.json({
      jobId,
      encryptedResponse,
      inputHash,
      outputHash,
      model,
    });
  } catch (error: any) {
    console.error("Inference error:", error);
    res.status(500).json({ error: "Inference failed", message: error.message });
  }
});

export default router;
