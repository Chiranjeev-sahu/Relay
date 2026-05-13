import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/features/auth/hooks";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { PrecisionGrid, FeatureWireframe, SectionHeader, CodeView, FaqItem, StickyNav, WorkflowStep, StatItem } from "@/components/landing-components";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/workspace", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <motion.div
      key="home"
      initial="hidden"
      animate="visible"
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
      transition={{ duration: 0.5 }}
      className="flex min-h-screen flex-col bg-background text-foreground"
    >
      <StickyNav onSignIn={() => navigate("/auth")} onGetStarted={() => navigate("/auth")} />

      <main className="flex-1">
        {/* Hero Section */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative flex flex-col items-center justify-center px-6 pt-32 pb-40 text-center"
        >
          <PrecisionGrid />

          <motion.div
            variants={fadeInUp}
            className="mb-6 inline-flex items-center gap-2 border border-border bg-background px-4 py-1 text-xs font-mono uppercase tracking-widest text-muted-foreground"
          >
            <span className="size-2 bg-primary"></span>
            Relay v1.0 / Architecture
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="max-w-4xl text-5xl font-black uppercase tracking-tighter sm:text-7xl lg:text-8xl"
          >
            API testing <br />
            <span className="text-primary">re-engineered.</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-8 max-w-xl text-lg text-muted-foreground"
          >
            A minimalist, high-performance workspace for modern API development.
            Precision tools, zero bloat.
          </motion.p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
            <Button
              size="lg"
              className="h-10 px-8 uppercase tracking-widest"
              onClick={() => navigate("/auth")}
            >
              Initialize
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-10 px-8 uppercase tracking-widest"
              onClick={() => navigate("/workspace?mode=guest")}
            >
              Guest Access
            </Button>
          </div>
        </motion.section>

        {/* Workflow Section */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="border-t border-border px-6 py-24"
        >
          <div className="mx-auto max-w-5xl">
            <SectionHeader title="Operational Workflow" subtitle="Streamlined for developer velocity." />
            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-12"
            >
              <WorkflowStep number="01" title="Configure" desc="Define your workspace and variables." />
              <WorkflowStep number="02" title="Execute" desc="Fire requests with precise control." />
              <WorkflowStep number="03" title="Analyze" desc="Review logs and optimize endpoints." />
            </motion.div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="border-t border-border bg-muted/20 px-6 py-12"
        >
          <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-0">
            <StatItem label="Active Requests" value="1.2M+" />
            <StatItem label="Avg Latency" value="12ms" />
            <StatItem label="Team Efficiency" value="40%" />
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="border-t border-border px-6 py-24"
        >
          <div className="mx-auto max-w-5xl">
            <SectionHeader 
              title="Core Capabilities" 
              subtitle="Built for developers who value precision over feature bloat."
            />
            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <FeatureWireframe 
                title="Team Sync" 
                description="Synchronized workspaces designed for high-velocity teams."
              />
              <FeatureWireframe 
                title="Dynamic ENV" 
                description="Instant context switching across local, staging, and production."
              />
              <FeatureWireframe 
                title="Audit Trail" 
                description="Automatic request logging for complete operational transparency."
              />
            </motion.div>
          </div>
        </motion.section>

        {/* Technical Showcase */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="border-t border-border bg-muted/20 px-6 py-24"
        >
          <div className="mx-auto max-w-5xl grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              variants={fadeInUp}
              className="text-left"
            >
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Technical Purity</h3>
              <p className="text-muted-foreground mb-6">
                Relay is designed to get out of your way. Our interface is a wrapper around 
                the most efficient API request engine available, ensuring your tests are as fast 
                as the network allows.
              </p>
              <Button variant="outline" className="uppercase tracking-widest">Read Documentation</Button>
            </motion.div>
            <CodeView />
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="border-t border-border px-6 py-24"
        >
          <div className="mx-auto max-w-3xl">
            <SectionHeader title="Technical FAQ" subtitle="Common questions about our architecture." />
            <motion.div
              variants={staggerContainer}
              className="space-y-4"
            >
              <FaqItem q="Is it web-native?" a="Yes. Relay runs entirely in your browser, utilizing optimized WebAssembly and IndexedDB." />
              <FaqItem q="Can I export data?" a="We support native JSON export for all collections, keeping you in control of your data." />
            </motion.div>
          </div>
        </motion.section>
      </main>

      <motion.footer
        variants={fadeInUp}
        className="border-t border-border px-6 py-12 text-center text-xs font-mono uppercase tracking-widest text-muted-foreground"
      >
        <div className="mb-4">Relay / Operational Interface</div>
        &copy; {new Date().getFullYear()} All Rights Reserved.
      </motion.footer>
    </motion.div>
  );
};
