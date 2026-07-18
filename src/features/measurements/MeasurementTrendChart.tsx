import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Card from "../../components/Card";
import { listMeasurements } from "../../db/queries/measurements";
import type { MeasurementType } from "../../db/types";

export default function MeasurementTrendChart({ type = "bodyweight" as MeasurementType }) {
  const [data, setData] = useState<{ date: string; value: number }[]>([]);

  useEffect(() => {
    listMeasurements(type).then((entries) =>
      setData(entries.map((m) => ({ date: m.date, value: m.value })))
    );
  }, [type]);

  if (data.length === 0) {
    return <Card className="text-sm text-slate-400">No {type} entries logged yet.</Card>;
  }

  return (
    <Card>
      <h2 className="mb-2 font-semibold capitalize">{type} trend</h2>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
