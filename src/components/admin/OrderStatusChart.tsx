"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface OrderStatusChartProps {
  data: { _id: string; count: number }[];
}

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  pending: { color: "#f59e0b", label: "Pending" },
  confirmed: { color: "#8b5cf6", label: "Confirmed" },
  shipped: { color: "#3b82f6", label: "Shipped" },
  delivered: { color: "#10b981", label: "Delivered" },
  cancelled: { color: "#ef4444", label: "Cancelled" },
  returned: { color: "#f97316", label: "Returned" },
};

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { color: string } }[];
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-white/15 rounded-xl shadow-xl px-3.5 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: payload[0].payload.color }}
          />
          <p className="text-xs font-semibold capitalize text-slate-200">
            {payload[0].name}
          </p>
        </div>
        <p className="text-sm font-black text-slate-100">
          {payload[0].value} orders
        </p>
      </div>
    );
  }
  return null;
};

export default function OrderStatusChart({ data }: OrderStatusChartProps) {
  const chartData = data.map((d) => ({
    name: STATUS_CONFIG[d._id]?.label ?? (d._id.charAt(0).toUpperCase() + d._id.slice(1)),
    value: d.count,
    color: STATUS_CONFIG[d._id]?.color ?? "#a855f7",
    status: d._id,
  }));

  const total = chartData.reduce((s, d) => s + d.value, 0);

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        No order data yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label with high contrast in dark mode */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-slate-100 drop-shadow-sm">{total}</span>
          <span className="text-xs font-semibold text-slate-400 -mt-0.5">
            Total Orders
          </span>
        </div>
      </div>

      {/* Legend with matching metrics */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1 border-t border-white/5">
        {chartData.map((item) => (
          <div key={item.status} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: item.color }}
            />
            <span className="text-xs font-medium text-slate-400 capitalize truncate">
              {item.name}
            </span>
            <span className="text-xs font-bold text-slate-200 ml-auto">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
