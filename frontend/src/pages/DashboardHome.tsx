import { motion } from "framer-motion";
import { Activity, Cpu, Shield, ArrowUpRight, Clock } from "lucide-react";

const mockJobs = [
  { id: "VM-0x8f3a", model: "GPT-4 Private", status: "verified", cost: "0.003 ETH", time: "2 min ago" },
  { id: "VM-0x1b2c", model: "LLaMA-70B", status: "processing", cost: "0.005 ETH", time: "5 min ago" },
  { id: "VM-0xd4e5", model: "Mistral-7B", status: "verified", cost: "0.001 ETH", time: "12 min ago" },
  { id: "VM-0x9a7f", model: "GPT-4 Private", status: "pending", cost: "0.004 ETH", time: "18 min ago" },
];

const stats = [
  { label: "Total Inferences", value: "1,247", icon: Cpu, change: "+12%" },
  { label: "Verified Proofs", value: "1,198", icon: Shield, change: "96.1%" },
  { label: "Avg Response", value: "2.4s", icon: Clock, change: "-8%" },
  { label: "Network Uptime", value: "99.97%", icon: Activity, change: "stable" },
];

const statusColors: Record<string, string> = {
  verified: "bg-primary/20 text-primary",
  processing: "bg-secondary/20 text-secondary",
  pending: "bg-muted text-muted-foreground",
};

const DashboardHome = () => {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Monitor your private AI inference activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-hover rounded-xl p-5 gradient-border"
          >
            <div className="flex items-center justify-between mb-3">
              <s.icon className="w-4 h-4 text-primary" />
              <span className="text-[10px] text-primary font-medium">{s.change}</span>
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-muted-foreground text-xs mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Jobs */}
      <div className="glass rounded-xl gradient-border overflow-hidden">
        <div className="p-5 border-b border-border/30">
          <h2 className="font-display font-semibold text-foreground">Recent Inference Jobs</h2>
        </div>
        <div className="divide-y divide-border/20">
          {mockJobs.map((job) => (
            <div key={job.id} className="px-5 py-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-primary">{job.id}</span>
                <span className="text-foreground text-sm">{job.model}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[job.status]}`}>
                  {job.status}
                </span>
                <span className="text-muted-foreground text-xs">{job.cost}</span>
                <span className="text-muted-foreground text-xs hidden sm:block">{job.time}</span>
                <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
