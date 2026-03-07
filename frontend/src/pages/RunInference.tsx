import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Upload, Loader2, CheckCircle, Zap } from "lucide-react";

const models = ["GPT-4 Private", "LLaMA-70B Encrypted", "Mistral-7B Secure", "Claude-3 Private"];

const RunInference = () => {
  const [model, setModel] = useState(models[0]);
  const [prompt, setPrompt] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<null | { output: string; proofHash: string; txHash: string }>(null);

  const handleRun = () => {
    if (!prompt.trim()) return;
    setRunning(true);
    setResult(null);
    setTimeout(() => {
      setRunning(false);
      setResult({
        output: "Based on the encrypted analysis of the provided data, the classification confidence is 94.2% for category A. The model processed 2,048 tokens with AES-256-GCM encryption applied to input and output.",
        proofHash: "0x8f3a...b29e4d1c7f0a2e5b9d3c6f8a1e4b7d0c3f6a9e",
        txHash: "0x1b2c...d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1",
      });
    }, 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Run Inference</h1>
        <p className="text-muted-foreground text-sm">Execute private AI computation with proof generation</p>
      </div>

      <div className="glass rounded-2xl p-6 gradient-border space-y-5">
        {/* Model selector */}
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Model</label>
          <div className="grid grid-cols-2 gap-2">
            {models.map((m) => (
              <button
                key={m}
                onClick={() => setModel(m)}
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
            className="w-full h-32 bg-muted/30 border border-border/30 rounded-xl px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 resize-none transition-all"
          />
        </div>

        {/* File upload */}
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Attach File (optional)</label>
          <div className="border border-dashed border-border/50 rounded-xl p-6 text-center hover:border-primary/30 transition-colors cursor-pointer">
            <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Drop file or click to upload</p>
          </div>
        </div>

        {/* Cost + Run */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-primary" />
            <span className="text-xs text-muted-foreground">Estimated cost: <span className="text-primary font-medium">~0.003 ETH</span></span>
          </div>
          <button
            onClick={handleRun}
            disabled={running || !prompt.trim()}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:shadow-[0_0_20px_hsl(160_100%_50%/0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {running ? (
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

      {/* Processing animation */}
      {running && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-8 gradient-border text-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 glow-green-strong">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <p className="font-display font-semibold text-foreground mb-1">Running Private Inference</p>
          <p className="text-muted-foreground text-xs">Encrypting input → Computing → Generating proof...</p>
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
            <button className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
              Verify Proof
            </button>
            <button className="px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:border-primary/30 transition-colors">
              View on Base Explorer
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RunInference;
