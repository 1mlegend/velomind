import { motion } from "framer-motion";
import { Search, ExternalLink, Wallet } from "lucide-react";
import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { CONTRACTS } from "@/config/contracts";

const ProofExplorer = () => {
  const { address, isConnected } = useAccount();
  const [search, setSearch] = useState("");

  const { data: proofIds } = useReadContract({
    address: CONTRACTS.proofRegistry.address,
    abi: CONTRACTS.proofRegistry.abi,
    functionName: "getProofsByUser",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Wallet className="w-12 h-12 text-primary mb-4" />
        <h2 className="font-display text-xl font-bold text-foreground mb-2">Connect Your Wallet</h2>
        <p className="text-muted-foreground text-sm">Connect your wallet to explore proofs</p>
      </div>
    );
  }

  const ids = (proofIds as `0x${string}`[] | undefined) || [];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Proof Explorer</h1>
        <p className="text-muted-foreground text-sm">Browse and verify cryptographic proofs anchored on Base</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by proof ID or hash..."
          className="w-full bg-card border border-border/30 rounded-xl pl-11 pr-4 py-3 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
        />
      </div>

      <div className="space-y-4">
        {ids.length === 0 ? (
          <div className="glass rounded-xl p-8 gradient-border text-center text-muted-foreground text-sm">
            No proofs found. Run an inference to generate your first proof.
          </div>
        ) : (
          ids.filter((id) => !search || id.toLowerCase().includes(search.toLowerCase())).map((proofId, i) => (
            <ProofCard key={proofId} proofId={proofId} index={i} />
          ))
        )}
      </div>
    </div>
  );
};

function ProofCard({ proofId, index }: { proofId: `0x${string}`; index: number }) {
  const { data: proof } = useReadContract({
    address: CONTRACTS.proofRegistry.address,
    abi: CONTRACTS.proofRegistry.abi,
    functionName: "getProof",
    args: [proofId],
  });

  const p = proof as any;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-hover rounded-xl p-5 gradient-border"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-primary font-semibold">
            {proofId.slice(0, 10)}...{proofId.slice(-6)}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
            verified
          </span>
        </div>
        {p?.timestamp && (
          <span className="text-muted-foreground text-xs">
            {new Date(Number(p.timestamp) * 1000).toLocaleString()}
          </span>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] text-muted-foreground mb-1">Input Hash</p>
          <p className="font-mono text-xs text-foreground bg-muted/20 rounded-lg p-2 break-all">
            {p?.inputHash ? `${(p.inputHash as string).slice(0, 14)}...${(p.inputHash as string).slice(-8)}` : "Loading..."}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground mb-1">Output Hash</p>
          <p className="font-mono text-xs text-foreground bg-muted/20 rounded-lg p-2 break-all">
            {p?.outputHash ? `${(p.outputHash as string).slice(0, 14)}...${(p.outputHash as string).slice(-8)}` : "Loading..."}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground mb-1">Model</p>
          <p className="font-mono text-xs text-secondary bg-muted/20 rounded-lg p-2 break-all flex items-center gap-1">
            {p?.model || "Loading..."}
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default ProofExplorer;
