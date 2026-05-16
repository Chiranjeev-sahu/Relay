import { FC } from "react";
import { motion } from "framer-motion";

export const PrecisionGrid: FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1, ease: "easeOut" }}
    className="absolute inset-0 -z-10 h-full w-full bg-background [mask-image:linear-gradient(to_bottom,white,transparent)]"
  >
    <svg className="h-full w-full stroke-border/50" width="100%" height="100%">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            d="M 40 0 L 0 0 0 40"
            fill="none"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  </motion.div>
);

export const FeatureWireframe: FC<{ title: string; description: string }> = ({ title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    whileHover={{ scale: 1.02, boxShadow: "0 0 0 1px var(--primary)" }}
    className="group relative border border-border bg-card p-8"
  >
    <div className="absolute -top-px -left-px size-4 border-t border-l border-primary" />
    <div className="absolute -bottom-px -right-px size-4 border-b border-r border-primary" />
    <h3 className="mb-3 text-lg font-bold uppercase tracking-widest">{title}</h3>
    <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
  </motion.div>
);
export const SectionHeader: FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="mb-16 text-center"
  >
    <h2 className="mb-4 text-3xl font-black uppercase tracking-tighter sm:text-4xl">{title}</h2>
    <p className="mx-auto max-w-xl text-muted-foreground">{subtitle}</p>
  </motion.div>
);

export const CodeView: FC = () => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.7 }}
    className="relative border border-border bg-muted/30 p-4 font-mono text-xs"
  >
    <motion.div
      className="absolute top-2 left-2 flex gap-1.5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <motion.div
        className="size-2 rounded-full bg-border"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
      />
      <motion.div
        className="size-2 rounded-full bg-border"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.7 }}
      />
      <motion.div
        className="size-2 rounded-full bg-border"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.9 }}
      />
    </motion.div>
    <motion.div
      className="pt-6 text-foreground/70"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <p><span className="text-primary">GET</span> /api/v1/workspace/relay/requests</p>
      <p className="mt-2 text-muted-foreground">Host: api.relay.dev</p>
      <p className="text-muted-foreground">Authorization: Bearer [TOKEN]</p>
      <motion.div
        className="mt-4 border-t border-border pt-4 text-foreground/90"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {"{ \"status\": \"operational\", \"latency\": \"12ms\" }"}
      </motion.div>
    </motion.div>
  </motion.div>
);

export const StickyNav: FC<{ onSignIn: () => void; onGetStarted: () => void }> = ({ onSignIn, onGetStarted }) => (
  <motion.nav
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 24 }}
    className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/80 px-6 py-4 backdrop-blur-md"
  >
    <motion.div
      className="font-black uppercase tracking-tighter"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      Relay<span className="text-primary">.</span>
    </motion.div>
    <motion.div
      className="flex gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <motion.button
        onClick={onSignIn}
        className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
        whileHover={{ scale: 1.05, color: "var(--primary)" }}
        whileTap={{ scale: 0.95 }}
      >
        Sign In
      </motion.button>
      <motion.button
        onClick={onGetStarted}
        className="text-xs font-bold uppercase tracking-widest text-primary hover:underline"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Get Started
      </motion.button>
    </motion.div>
  </motion.nav>
);

export const WorkflowStep: FC<{ number: string; title: string; desc: string }> = ({ number, title, desc }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="flex gap-4"
  >
    <motion.div
      className="flex size-10 items-center justify-center border border-border font-black tracking-tighter text-primary"
      whileHover={{ scale: 1.1, backgroundColor: "var(--primary-foreground)", color: "var(--primary)" }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {number}
    </motion.div>
    <div>
      <h4 className="font-black uppercase tracking-tighter">{title}</h4>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  </motion.div>
);

export const StatItem: FC<{ label: string; value: string }> = ({ label, value }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="border border-border p-6 text-center"
  >
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.8, ease: "easeInOut" }}
      className="text-3xl font-black uppercase tracking-tighter text-primary"
    >
      {value}
    </motion.div>
    <div className="mt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
  </motion.div>
);

export const FaqItem: FC<{ q: string; a: string }> = ({ q, a }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
    className="border-b border-border py-6"
  >
    <motion.h4
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="font-bold uppercase tracking-wide"
    >
      {q}
    </motion.h4>
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-2 text-sm text-muted-foreground"
    >
      {a}
    </motion.p>
  </motion.div>
);
