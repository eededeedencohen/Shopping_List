// ========================
// RadialProgressCard.js
// ========================
import { motion } from "framer-motion";
import { Gauge } from "lucide-react";
import ChartCard from "./ChartCard";

export default function RadialProgressCard({
  percent = 64,
  title = "Completion",
}) {
  const stroke = 8;
  const size = 96;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <ChartCard className="items-center flex flex-col gap-4 p-6">
      <div className="flex items-center gap-2">
        <Gauge className="h-5 w-5 text-lime-400" />
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          {title}
        </h3>
      </div>

      <motion.svg
        className="rotate-[-90deg]"
        width={size}
        height={size}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#334155"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#22d3ee"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          strokeLinecap="round"
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          className="text-xl fill-cyan-300 font-bold rotate-[90deg]"
        >
          {percent}%
        </text>
      </motion.svg>
    </ChartCard>
  );
}
