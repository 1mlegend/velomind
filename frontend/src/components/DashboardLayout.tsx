import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Play, History, Search, Menu, X } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import ConnectWalletButton from "@/components/ConnectWalletButton";
import velomindLogo from "@/assets/velomind-logo.png";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Play, label: "Run Inference", path: "/dashboard/run" },
  { icon: History, label: "History", path: "/dashboard/history" },
  { icon: Search, label: "Proof Explorer", path: "/dashboard/proofs" },
];

const DashboardLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 glass border-r border-border/30 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={velomindLogo} alt="Velomind" className="w-8 h-8 object-contain" />
            <span className="font-display font-bold text-foreground">Velomind</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  active
                    ? "bg-primary/10 text-primary glow-green"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-40 glass border-b border-border/30 h-14 flex items-center px-6 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <ConnectWalletButton />
        </header>

        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6"
        >
          <Outlet />
        </motion.main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-background/80 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

export default DashboardLayout;
