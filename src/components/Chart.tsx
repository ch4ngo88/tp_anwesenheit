import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import type { Member } from "../types/member";

interface Props {
  members: Member[];
}

export default function Chart({ members }: Props) {
  const allDates = Array.from(
    new Set(members.flatMap((m) => m.attendance.map((a) => a.date)))
  ).sort();

  const rawData = members.map((m) => {
    const relevantDates = allDates.filter((d) => d >= m.joined);
    const relevantEntries = m.attendance.filter((a) =>
      relevantDates.includes(a.date)
    );
    const total = relevantDates.length;
    const present = relevantEntries.filter((a) => a.present).length;
    const percent = total > 0 ? Math.round((present / total) * 100) : 0;
    return { name: m.name, percent };
  });

  const sorted = [...rawData].sort((a, b) => b.percent - a.percent);

  let currentRank = 1;
  let lastPercent = sorted[0]?.percent ?? 0;

  const data = sorted.map((entry, index) => {
    if (index > 0 && entry.percent !== lastPercent) {
      currentRank += 1;
      lastPercent = entry.percent;
    }

    return {
      ...entry,
      rank: `${currentRank}.`,
      label: `${currentRank}. ${entry.name} (${entry.percent}%)`,
    };
  });

  const getColor = (percent: number) => {
    if (percent >= 70) return "#22c55e"; // Grün
    if (percent <= 30) return "#ef4444"; // Rot
    return "#facc15"; // Gelb
  };

  return (
    <div className="w-full min-h-[400px] sm:h-[600px] bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Anwesenheit (in %)
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 10, right: 30, bottom: 10, left: 50 }}
          barSize={40}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            tickFormatter={(val) => `${val}%`}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="rank"
            tick={false}
            width={0}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#f9fafb",
              border: "1px solid #d1d5db",
              borderRadius: "0.5rem",
              fontSize: "14px",
            }}
            formatter={(value: number) => [`${value}%`, "Anwesenheit"]}
            labelFormatter={() => ""}
          />
          <Bar dataKey="percent" radius={[20, 20, 20, 20]}>
            {data.map((entry) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={getColor(entry.percent)}
                style={{ transition: "fill 0.3s ease" }}
              />
            ))}
            <LabelList
              dataKey="label"
              position="insideLeft"
              style={{
                fill: "#1f2937",
                fontWeight: "600",
                fontSize: 13,
                pointerEvents: "none", // keine Hover-Interaktion
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
