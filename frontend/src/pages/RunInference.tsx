import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Loader2, CheckCircle, Zap, Lock } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { generateEncryptionKey, encryptPrompt, decryptResponse } from "@/lib/crypto";
import { runInferenceAPI, confirmProof } from "@/lib/api";
import { TREASURY_ADDRESS, INFERENCE_FEE } from "@/config/wagmi";

const models = ["GPT-4 Private", "LLaMA-70B Encrypted", "Mistral-7B Secure", "Claude-3 Private"];

type InferenceResult = {
  output: string;
  proofHash: string;
  txHash: string;
  jobId: string;
};

type Step = "idle" | "encrypting" | "inferring" | "paying" | "proving" | "done";

const RunInference = () => {
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [model, setModel] = useState(models[0]);
  const [prompt, setPrompt] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [result, setResult] = useState<InferenceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    if (!prompt.trim() || !connected || !publicKey) return;
    setError(null);
    setResult(null);

    try {
      // Step 1: Encrypt
      setStep("encrypting");
      const { key, keyHex } = await generateEncryptionKey();
      const encryptedPromptData = await encryptPrompt(prompt, key);

      // Step 2: Run inference
      setStep("inferring");
      const inferenceResult = await runInferenceAPI({
        encryptedPrompt: encryptedPromptData,
        model,
        walletAddress: publicKey.toBase58(),
        encryptionKey: keyHex,
      });

      // Step 3: Pay via SOL transfer
      setStep("paying");
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(TREASURY_ADDRESS),
          lamports: Math.round(INFERENCE_FEE * LAMPORTS_PER_SOL),
        })
      );
      const txHash = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(txHash, 'confirmed');

      // Step 4: Confirm proof in backend
      setStep("proving");
      await confirmProof({
        jobId: inferenceResult.jobId,
        inputHash: inferenceResult.inputHash,
        outputHash: inferenceResult.outputHash,
        onChainTxHash: txHash,
      });

      // Decrypt response
      const decryptedOutput = await decryptResponse(inferenceResult.encryptedResponse, key);

      setResult({
        output: decryptedOutput,
        proofHash: inferenceResult.outputHash,
        txHash: txHash,
        jobId: inferenceResult.jobId,
      });
      setStep("done");
    } catch (err: any) {
      console.error("Inference error:", err);
      setError(err.message || "Something went wrong");
      setStep("idle");
    }
  };

  const stepLabels: Record<Step, string> = {
    idle: "",
    encrypting: "Encrypting your prompt...",
    inferring: "Running private inference...",
    paying: "Processing payment...",
    proving: "Confirming proof...",
    done: "",
  };

  const isRunning = step !== "idle" && step !== "done";

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Run Inference</h1>
        <p className="text-muted-foreground text-sm">Execute private AI computation with proof generation</p>
      </div>

      {!connected && (
        <div className="glass rounded-2xl p-6 gradient-border text-center">
          <Lock className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="text-foreground font-medium">Connect your wallet to run inference</p>
          <p className="text-muted-foreground text-sm mt-1">A wallet connection is required to pay for and verify computations</p>
        </div>
      )}

      {connected && (
        <div className="glass rounded-2xl p-6 gradient-border space-y-5">
          {/* Model selector */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Model</label>
            <div className="grid grid-cols-2 gap-2">
              {models.map((m) => (
                <button
                  key={m}
                  onClick={() => setModel(m)}
                  disabled={isRunning}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    model === m
                      ? "bg-primary/15 text-primary border border-primary/30 glow-green"
                      : "bg-muted/30 text-muted-foreground border border-border/30 hover:border-border"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your private inference prompt..."
              disabled={isRunning}
              className="w-full h-32 bg-muted/30 border border-border/30 rounded-xl px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 resize-none transition-all disabled:opacity-50"
            />
          </div>

          {/* Cost + Run */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-xs text-muted-foreground">Cost: <span className="text-primary font-medium">{INFERENCE_FEE} SOL</span></span>
            </div>
            <button
              onClick={handleRun}
              disabled={isRunning || !prompt.trim()}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:shadow-[0_0_20px_hsl(267_100%_64%/0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Inference
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass rounded-2xl p-4 border border-destructive/30 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Processing animation */}
      {isRunning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-8 gradient-border text-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 glow-green-strong">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <p className="font-display font-semibold text-foreground mb-1">Running Private Inference</p>
          <p className="text-muted-foreground text-xs">{stepLabels[step]}</p>
        </motion.div>
      )}

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 gradient-border space-y-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span className="font-display font-semibold text-foreground">Inference Complete</span>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Result</label>
            <p className="text-foreground text-sm bg-muted/20 rounded-lg p-4">{result.output}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Proof Hash</label>
              <p className="font-mono text-xs text-primary bg-muted/20 rounded-lg p-3 break-all">{result.proofHash}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Transaction Hash</label>
              <p className="font-mono text-xs text-secondary bg-muted/20 rounded-lg p-3 break-all">{result.txHash}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <a
              href={`https://solscan.io/tx/${result.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              View on Solscan
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RunInference;
