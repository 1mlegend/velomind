import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const jobs = [
  { id: "VM-0x8f3a", model: "GPT-4 Private", status: "verified", cost: "0.003 ETH", timestamp: "2026-03-06 14:23" },
  { id: "VM-0x1b2c", model: "LLaMA-70B", status: "processing", cost: "0.005 ETH", timestamp: "2026-03-06 14:18" },
  { id: "VM-0xd4e5", model: "Mistral-7B", status: "verified", cost: "0.001 ETH", timestamp: "2026-03-06 14:05" },
  { id: "VM-0x9a7f", model: "GPT-4 Private", status: "verified", cost: "0.004 ETH", timestamp: "2026-03-06 13:52" },
  { id: "VM-0x3c6d", model: "Claude-3 Private", status: "failed", cost: "0.002 ETH", timestamp: "2026-03-06 13:40" },
  { id: "VM-0xe7f8", model: "Mistral-7B", status: "verified", cost: "0.001 ETH", timestamp: "2026-03-06 13:28" },
];

const statusColors: Record<string, string> = {
  verified: "bg-primary/20 text-primary",
  processing: "bg-secondary/20 text-secondary",
  failed: "bg-destructive/20 text-destructive",
  pending: "bg-muted text-muted-foreground",
};

const HistoryPage = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Inference History</h1>
        <p className="text-muted-foreground text-sm">All your past inference jobs and their verification status</p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass rounded-xl gradient-border overflow-hidden"
      >
        {/* Header */}
        <div className="hidden sm:grid grid-cols-6 gap-4 px-5 py-3 border-b border-border/30 text-xs text-muted-foreground font-medium">
          <span>Job ID</span>
          <span>Model</span>
          <span>Status</span>
          <span>Cost</span>
          <span>Timestamp</span>
          <span></span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border/20">
          {jobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="grid sm:grid-cols-6 gap-2 sm:gap-4 px-5 py-4 hover:bg-muted/20 transition-colors items-center cursor-pointer"
            >
              <span className="font-mono text-xs text-primary">{job.id}</span>
              <span className="text-foreground text-sm">{job.model}</span>
              <span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[job.status]}`}>
                  {job.status}
                </span>
              </span>
              <span className="text-muted-foreground text-xs">{job.cost}</span>
              <span className="text-muted-foreground text-xs">{job.timestamp}</span>
              <span className="text-right">
                <ArrowUpRight className="w-3 h-3 text-muted-foreground inline" />
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default HistoryPage;
