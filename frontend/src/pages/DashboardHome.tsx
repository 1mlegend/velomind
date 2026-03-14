import { motion } from "framer-motion";
import { Activity, Cpu, Shield, ArrowUpRight, Clock, Wallet } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { getStats, getJobs } from "@/lib/api";

const statusColors: Record<string, string> = {
  verified: "bg-primary/20 text-primary",
  processing: "bg-secondary/20 text-secondary",
  pending: "bg-muted text-muted-foreground",
  failed: "bg-destructive/20 text-destructive",
};

const DashboardHome = () => {
  const { publicKey, connected } = useWallet();
  const address = publicKey?.toBase58();

  const { data: stats } = useQuery({
    queryKey: ["stats", address],
    queryFn: () => getStats(address!),
    enabled: !!address,
  });

  const { data: jobs } = useQuery({
    queryKey: ["jobs", address],
    queryFn: () => getJobs(address!),
    enabled: !!address,
  });

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Wallet className="w-12 h-12 text-primary mb-4" />
        <h2 className="font-display text-xl font-bold text-foreground mb-2">Connect Your Wallet</h2>
        <p className="text-muted-foreground text-sm">Connect your wallet to view your dashboard</p>
      </div>
    );
  }

  const statCards = [
    { label: "Total Inferences", value: stats?.totalInferences ?? 0, icon: Cpu, change: "" },
    { label: "Verified Proofs", value: stats?.verifiedProofs ?? 0, icon: Shield, change: `${stats?.verificationRate ?? 0}%` },
    { label: "Avg Response", value: "~3s", icon: Clock, change: "" },
    { label: "Network Uptime", value: "99.97%", icon: Activity, change: "stable" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Monitor your private AI inference activity</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-hover rounded-xl p-5 gradient-border"
          >
            <div className="flex items-center justify-between mb-3">
              <s.icon className="w-4 h-4 text-primary" />
              {s.change && <span className="text-[10px] text-primary font-medium">{s.change}</span>}
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-muted-foreground text-xs mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass rounded-xl gradient-border overflow-hidden">
        <div className="p-5 border-b border-border/30">
          <h2 className="font-display font-semibold text-foreground">Recent Inference Jobs</h2>
        </div>
        <div className="divide-y divide-border/20">
          {(!jobs || jobs.length === 0) ? (
            <div className="px-5 py-8 text-center text-muted-foreground text-sm">
              No inference jobs yet. Run your first inference to get started.
            </div>
          ) : (
            jobs.slice(0, 5).map((job: any) => (
              <div key={job.id} className="px-5 py-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-primary">{job.id.slice(0, 10)}...</span>
                  <span className="text-foreground text-sm">{job.model}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[job.status] || statusColors.pending}`}>
                    {job.status}
                  </span>
                  <span className="text-muted-foreground text-xs">{job.cost} SOL</span>
                  <span className="text-muted-foreground text-xs hidden sm:block">
                    {new Date(job.createdAt).toLocaleString()}
                  </span>
                  <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
