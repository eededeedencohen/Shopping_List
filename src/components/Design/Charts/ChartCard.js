// ========================
// ChartCard.js
// ========================
import { motion } from "framer-motion";

/* helper לחיבור class-ים */
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ChartCard({ className, children }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "animate-fadeSlideUp rounded-2xl p-4 w-full shadow-lg backdrop-blur-md",
        "relative before:content-[''] before:absolute before:inset-px before:rounded-[inherit]",
        "before:bg-gradient-to-br before:from-cyan-500/30 before:via-fuchsia-500/20 before:to-indigo-500/30",
        "bg-[#0f172a]/60",
        className
      )}
    >
      {/* התוכן מעל גבול הגרדיאנט */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
