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

  const data = members.map((m) => {
    const relevantDates = allDates.filter((d) => d >= m.joined);
    const relevantEntries = m.attendance.filter((a) =>
      relevantDates.includes(a.date)
    );

    const total = relevantDates.length;
    const present = relevantEntries.filter((a) => a.present).length;
    const percent = total > 0 ? Math.round((present / total) * 100) : 0;

    return { name: m.name, percent };
  });

  return (
    <div className="w-full min-h-[350px] sm:h-[450px] bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Anwesenheit (in %)</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data.sort((a, b) => b.percent - a.percent)}
          margin={{ top: 10, right: 20, bottom: 0, left: 60 }}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            tickFormatter={(val) => `${val}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12 }}
            width={100}
          />
          <Tooltip formatter={(value: number) => `${value}%`} />
          <Bar dataKey="percent">
            {data.map((entry) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={
                  entry.percent > 75
                    ? "#16a34a" // Tailwind green-600
                    : entry.percent < 25
                    ? "#dc2626" // Tailwind red-600
                    : "#eab308" // Tailwind yellow-500
                }
              />
            ))}
            <LabelList
              dataKey="percent"
              position="insideRight"
              formatter={(val: number) => `${val}%`}
              style={{
                fill: "#000",
                fontWeight: "bold",
                fontSize: 12,
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
