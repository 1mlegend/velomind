import { motion } from "framer-motion";
import { ArrowUpRight, Wallet } from "lucide-react";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { getJobs } from "@/lib/api";

const statusColors: Record<string, string> = {
  verified: "bg-primary/20 text-primary",
  processing: "bg-secondary/20 text-secondary",
  failed: "bg-destructive/20 text-destructive",
  pending: "bg-muted text-muted-foreground",
};

const HistoryPage = () => {
  const { address, isConnected } = useAccount();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs", address],
    queryFn: () => getJobs(address!),
    enabled: !!address,
  });

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Wallet className="w-12 h-12 text-primary mb-4" />
        <h2 className="font-display text-xl font-bold text-foreground mb-2">Connect Your Wallet</h2>
        <p className="text-muted-foreground text-sm">Connect your wallet to view inference history</p>
      </div>
    );
  }

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
        <div className="hidden sm:grid grid-cols-6 gap-4 px-5 py-3 border-b border-border/30 text-xs text-muted-foreground font-medium">
          <span>Job ID</span>
          <span>Model</span>
          <span>Status</span>
          <span>Cost</span>
          <span>Timestamp</span>
          <span></span>
        </div>

        <div className="divide-y divide-border/20">
          {isLoading ? (
            <div className="px-5 py-8 text-center text-muted-foreground text-sm">Loading...</div>
          ) : (!jobs || jobs.length === 0) ? (
            <div className="px-5 py-8 text-center text-muted-foreground text-sm">No jobs yet.</div>
          ) : (
            jobs.map((job: any, i: number) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="grid sm:grid-cols-6 gap-2 sm:gap-4 px-5 py-4 hover:bg-muted/20 transition-colors items-center"
              >
                <span className="font-mono text-xs text-primary">{job.id.slice(0, 10)}...</span>
                <span className="text-foreground text-sm">{job.model}</span>
                <span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[job.status] || statusColors.pending}`}>
                    {job.status}
                  </span>
                </span>
                <span className="text-muted-foreground text-xs">{job.cost} ETH</span>
                <span className="text-muted-foreground text-xs">{new Date(job.createdAt).toLocaleString()}</span>
                <span className="text-right">
                  {job.proofTxHash ? (
                    <a href={`https://basescan.org/tx/${job.proofTxHash}`} target="_blank" rel="noopener noreferrer">
                      <ArrowUpRight className="w-3 h-3 text-primary inline" />
                    </a>
                  ) : (
                    <ArrowUpRight className="w-3 h-3 text-muted-foreground inline" />
                  )}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default HistoryPage;
