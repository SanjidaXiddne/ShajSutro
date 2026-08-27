"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface RevenueChartProps {
  data: { date: string; revenue: number }[];
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "rgba(15,15,25,0.95)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "14px",
          padding: "10px 14px",
          backdropFilter: "blur(12px)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        <p className="text-[11px] font-medium mb-1" style={{ color: "rgba(148, 163, 184, 0.6)" }}>{label}</p>
        <p className="text-sm font-black" style={{ color: "#e2e8f0" }}>
          ৳{payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ data }: RevenueChartProps) {
  const chartData =
    data && data.length > 0
      ? data
      : (() => {
          const list = [];
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            list.push({
              date: d.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              revenue: 0,
            });
          }
          return list;
        })();

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 15, left: 10, bottom: 15 }}
      >
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.05)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "rgba(148,163,184,0.7)", fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          dy={8}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: "rgba(148,163,184,0.7)", fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `৳${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
          width={50}
          dx={-6}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: "#a78bfa", strokeWidth: 1, strokeDasharray: "4 4" }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#a78bfa"
          strokeWidth={2.5}
          fill="url(#revenueGrad)"
          dot={false}
          activeDot={{ r: 5, strokeWidth: 0, fill: "#a78bfa" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
