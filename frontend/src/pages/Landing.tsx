import { motion } from "framer-motion";
import { Shield, Lock, Cpu, ChevronRight, Eye, Database, Github, Twitter } from "lucide-react";
import NetworkGlobe from "@/components/NetworkGlobe";
import ConnectWalletButton from "@/components/ConnectWalletButton";
import velomindLogo from "@/assets/velomind-logo.png";
import privacyIllustration from "@/assets/privacy-illustration.png";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <div className="fixed top-0 left-0 right-0 z-50 px-6 py-6 bg-transparent">
        <nav className="max-w-4xl mx-auto border border-border/10 rounded-full px-6 py-3" style={{ background: "rgba(10, 11, 20, 0.9)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)" }}>
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src={velomindLogo} alt="Velomind" className="w-7 h-7 object-contain" />
              <span className="font-display font-semibold text-lg tracking-tight text-foreground">Velo<span className="text-primary text-glow-green">Mind</span></span>
            </a>
            <ul className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <li>
                <a href="#features" className="hover:text-foreground transition-colors duration-300 px-4 py-2 rounded-full hover:bg-white/5">Features</a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-foreground transition-colors duration-300 px-4 py-2 rounded-full hover:bg-white/5">Privacy</a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-foreground transition-colors duration-300 px-4 py-2 rounded-full hover:bg-white/5">How it Works</a>
              </li>
            </ul>
            <div className="flex items-center gap-3">
              <a href="https://x.com/VeloMind_" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-5 py-2 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:shadow-[0_0_20px_hsl(160_100%_50%/0.3)] transition-all duration-300"
              >
                Launch App
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="absolute inset-0">
          <NetworkGlobe />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-6">
              Velo<span className="text-primary text-glow-green">Mind</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-light mb-4 font-display">
              The Future is Shared. The Network is Yours.
            </p>
            <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto mb-10">
              Collective security. Privacy. Decentralized strength. Run private AI inference with cryptographic proof verification on Base.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/dashboard")}
                className="group px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:shadow-[0_0_30px_hsl(160_100%_50%/0.4)] transition-all duration-300 flex items-center justify-center gap-2"
              >
                Launch App
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 rounded-xl border border-border text-foreground font-medium text-base hover:border-primary/40 hover:bg-primary/5 transition-all duration-300">
                Read GitHub
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              What is <span className="text-primary text-glow-green">Velomind</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A next-generation platform combining private AI inference, verifiable computation, and decentralized infrastructure.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Lock,
                title: "Private AI Inference",
                desc: "Run AI computations on encrypted data. Your prompts never leave your control — only cryptographic hashes are stored.",
                color: "primary",
              },
              {
                icon: Shield,
                title: "Verifiable Computation",
                desc: "Every inference generates a cryptographic proof. Verify results are authentic and untampered — trustlessly.",
                color: "primary",
              },
              {
                icon: Cpu,
                title: "Decentralized Infrastructure",
                desc: "Computation distributed across a network of nodes. No single point of failure. No central authority.",
                color: "primary",
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-hover rounded-2xl p-8 gradient-border"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 glow-green">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section id="privacy" className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                Privacy-First <span className="text-primary">AI</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Your data is encrypted client-side before any computation begins. Velomind never stores raw prompts — only hashes and encrypted payloads. You maintain complete sovereignty over your data.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Eye, text: "Zero-knowledge proof verification" },
                  { icon: Lock, text: "Client-side encryption by default" },
                  { icon: Database, text: "Only hashes stored on-chain" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl glass gradient-border flex items-center justify-center overflow-hidden">
                <img src={privacyIllustration} alt="Privacy Illustration" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-32 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              How It <span className="text-primary">Works</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-4">
            {[
              { step: "01", title: "User Input", desc: "Submit your prompt or data" },
              { step: "02", title: "Encryption", desc: "Client-side encryption applied" },
              { step: "03", title: "AI Compute", desc: "Private inference executed" },
              { step: "04", title: "Proof Gen", desc: "Cryptographic proof created" },
              { step: "05", title: "On-Chain", desc: "Proof anchored on Base" },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-hover rounded-2xl p-6 text-center gradient-border"
              >
                <div className="text-primary font-display font-bold text-2xl mb-2 text-glow-green">{s.step}</div>
                <h3 className="font-display font-semibold text-foreground mb-1">{s.title}</h3>
                <p className="text-muted-foreground text-xs">{s.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 w-full aspect-video rounded-3xl overflow-hidden gradient-border">
            {/* @ts-ignore */}
            <spline-viewer url="https://prod.spline.design/hVjddXLNOEh1biJE/scene.splinecode" style={{ width: '100%', height: '100%' }} />
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={velomindLogo} alt="Velomind" className="w-5 h-5 object-contain" />
            <span className="font-display font-semibold text-foreground">Velomind</span>
          </div>
          <p className="text-muted-foreground text-xs">
            © 2026 Velomind. Built on Base. Privacy by design.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://x.com/VeloMind_" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
