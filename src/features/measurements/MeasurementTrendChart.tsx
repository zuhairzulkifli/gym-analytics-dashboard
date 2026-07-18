import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Card from "../../components/Card";
import { listMeasurements } from "../../db/queries/measurements";
import { CHART_AXIS_TICK, CHART_TOOLTIP_STYLE } from "../../utils/chartTheme";
import type { MeasurementType } from "../../db/types";

export default function MeasurementTrendChart({
  type = "bodyweight" as MeasurementType,
  revealDelayMs
}: {
  type?: MeasurementType;
  revealDelayMs?: number;
}) {
  const [data, setData] = useState<{ date: string; value: number }[]>([]);

  useEffect(() => {
    listMeasurements(type).then((entries) =>
      setData(entries.map((m) => ({ date: m.date, value: m.value })))
    );
  }, [type]);

  if (data.length === 0) {
    return (
      <Card revealDelayMs={revealDelayMs} className="text-sm text-ink-muted">
        No {type} entries logged yet.
      </Card>
    );
  }

  return (
    <Card revealDelayMs={revealDelayMs}>
      <h2 className="mb-2 font-display text-lg font-semibold capitalize">{type} trend</h2>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <XAxis dataKey="date" tick={CHART_AXIS_TICK} />
          <YAxis tick={CHART_AXIS_TICK} domain={["auto", "auto"]} />
          <Tooltip {...CHART_TOOLTIP_STYLE} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#e08a5f"
            strokeWidth={2.5}
            dot={false}
            animationDuration={600}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
