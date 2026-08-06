"use client";
import * as React from "react";
import { format } from "date-fns";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SkinMetric, SKIN_METRIC_CHART_COLORS, SKIN_METRIC_LABELS } from "@/config/metrics.config";

interface MetricTrendChartProps {
  metric: SkinMetric;
  data: { date: string; value: number }[];
}

function CustomTooltip({ active, payload, label, metric }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-raised">
      <p className="font-medium text-foreground">{format(new Date(label), "MMM d, yyyy")}</p>
      <p className="mt-0.5 font-mono" style={{ color: SKIN_METRIC_CHART_COLORS[metric as SkinMetric] }}>
        {SKIN_METRIC_LABELS[metric as SkinMetric]}: {payload[0].value}
      </p>
    </div>
  );
}

export function MetricTrendChart({ metric, data }: MetricTrendChartProps) {
  const color = SKIN_METRIC_CHART_COLORS[metric];

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => format(new Date(v), "MMM d")}
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          axisLine={{ stroke: "hsl(var(--border))" }}
          tickLine={false}
        />
        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={28} />
        <Tooltip content={<CustomTooltip metric={metric} />} />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 2.5, fill: color, strokeWidth: 0 }} activeDot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
