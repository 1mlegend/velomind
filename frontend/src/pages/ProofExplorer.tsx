import { motion } from "framer-motion";
import { Search, ExternalLink } from "lucide-react";
import { useState } from "react";

const proofs = [
  {
    id: "PF-0x8f3a",
    inputHash: "0x8f3a1b2c...d4e5f6a7",
    outputHash: "0x9b4c2d3e...e5f6a7b8",
    txHash: "0x1b2c3d4e...f6a7b8c9",
    timestamp: "2026-03-06 14:23",
    status: "verified",
  },
  {
    id: "PF-0xd4e5",
    inputHash: "0xd4e5f6a7...b8c9d0e1",
    outputHash: "0xe5f6a7b8...c9d0e1f2",
    txHash: "0x3d4e5f6a...a7b8c9d0",
    timestamp: "2026-03-06 14:05",
    status: "verified",
  },
  {
    id: "PF-0x9a7f",
    inputHash: "0x9a7f8b6c...d0e1f2a3",
    outputHash: "0xa8b9c0d1...e1f2a3b4",
    txHash: "0x5e6f7a8b...b8c9d0e1",
    timestamp: "2026-03-06 13:52",
    status: "verified",
  },
];

const ProofExplorer = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Proof Explorer</h1>
        <p className="text-muted-foreground text-sm">Browse and verify cryptographic proofs anchored on Base</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by proof ID, hash, or transaction..."
          className="w-full bg-card border border-border/30 rounded-xl pl-11 pr-4 py-3 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Proofs */}
      <div className="space-y-4">
        {proofs.map((proof, i) => (
          <motion.div
            key={proof.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-hover rounded-xl p-5 gradient-border"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-primary font-semibold">{proof.id}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                  {proof.status}
                </span>
              </div>
              <span className="text-muted-foreground text-xs">{proof.timestamp}</span>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Input Hash</p>
                <p className="font-mono text-xs text-foreground bg-muted/20 rounded-lg p-2 break-all">{proof.inputHash}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Output Hash</p>
                <p className="font-mono text-xs text-foreground bg-muted/20 rounded-lg p-2 break-all">{proof.outputHash}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Transaction</p>
                <div className="font-mono text-xs text-secondary bg-muted/20 rounded-lg p-2 break-all flex items-center gap-1">
                  {proof.txHash}
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProofExplorer;
