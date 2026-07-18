import { useEffect, useState } from "react";
import type { Template } from "../../db/types";
import { listTemplates, deleteTemplate } from "../../db/queries/templates";

export default function TemplateList({
  onStart
}: {
  onStart?: (template: Template) => void;
}) {
  const [templates, setTemplates] = useState<Template[]>([]);

  const reload = () => listTemplates().then(setTemplates);

  useEffect(() => {
    reload();
  }, []);

  if (templates.length === 0) {
    return <p className="text-sm text-slate-400">No templates saved yet.</p>;
  }

  return (
    <div className="space-y-2">
      {templates.map((t) => (
        <div key={t.id} className="flex items-center justify-between rounded-lg bg-slate-800 px-3 py-2 text-sm">
          <div>
            <p className="font-semibold">{t.name}</p>
            <p className="text-xs text-slate-500">{t.items.length} exercises</p>
          </div>
          <div className="flex gap-2">
            {onStart && (
              <button className="rounded-lg bg-brand px-2 py-1 text-xs" onClick={() => onStart(t)}>
                Start
              </button>
            )}
            <button
              className="rounded-lg bg-slate-700 px-2 py-1 text-xs"
              onClick={async () => {
                await deleteTemplate(t.id!);
                reload();
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
