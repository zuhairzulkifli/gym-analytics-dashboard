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
    return <p className="text-sm text-ink-muted">No templates saved yet.</p>;
  }

  return (
    <div className="space-y-2">
      {templates.map((t) => (
        <div key={t.id} className="flex items-center justify-between rounded-lg bg-surface-card px-3 py-2 text-sm">
          <div>
            <p className="font-semibold">{t.name}</p>
            <p className="text-xs text-ink-muted">{t.items.length} exercises</p>
          </div>
          <div className="flex gap-2">
            {onStart && (
              <button
                className="rounded-lg bg-accent px-3 py-2 text-xs text-white transition-colors duration-200 hover:bg-accent-dark"
                onClick={() => onStart(t)}
              >
                Start
              </button>
            )}
            <button
              className="rounded-lg bg-surface-raised px-3 py-2 text-xs transition-colors duration-200 hover:bg-surface-raised2"
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
