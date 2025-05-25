// ========================
// StatsDashboard.js
// ========================
import LineChartCard from "./LineChartCard";
import BarChartCard from "./BarChartCard";
import RadialProgressCard from "./RadialProgressCard";
import "./animations.css";

// Mock data
const weeks = [
  { label: "Mon", value: 240 },
  { label: "Tue", value: 280 },
  { label: "Wed", value: 220 },
  { label: "Thu", value: 340 },
  { label: "Fri", value: 260 },
  { label: "Sat", value: 300 },
  { label: "Sun", value: 380 },
];

const months = [
  { label: "Jan", value: 3200 },
  { label: "Feb", value: 4200 },
  { label: "Mar", value: 3800 },
  { label: "Apr", value: 5000 },
  { label: "May", value: 6200 },
  { label: "Jun", value: 7100 },
];

export default function StatsDashboard() {
  return (
    <div className="flex flex-col gap-6 p-4 max-w-sm mx-auto">
      <RadialProgressCard percent={64} title="Weekly Goal" />
      <LineChartCard data={weeks} title="Weekly Revenue" />
      <BarChartCard data={months} title="Monthly Users" />
    </div>
  );
}
