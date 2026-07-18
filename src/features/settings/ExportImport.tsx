import { useRef } from "react";
import { exportAllDataAsJson, importAllDataFromJson, exportSetsAsCsv } from "../../utils/backup";
import { useToast } from "../../components/Toast";

function download(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportImport() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  return (
    <div className="space-y-2">
      <button
        className="w-full rounded-lg bg-slate-800 py-2 text-sm"
        onClick={async () => {
          const json = await exportAllDataAsJson();
          download(`gym-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`, json, "application/json");
        }}
      >
        ⬇️ Export full backup (JSON)
      </button>
      <button
        className="w-full rounded-lg bg-slate-800 py-2 text-sm"
        onClick={async () => {
          const csv = await exportSetsAsCsv();
          download(`gym-tracker-sets-${new Date().toISOString().slice(0, 10)}.csv`, csv, "text/csv");
        }}
      >
        ⬇️ Export sets (CSV)
      </button>
      <button
        className="w-full rounded-lg bg-slate-800 py-2 text-sm"
        onClick={() => fileInputRef.current?.click()}
      >
        ⬆️ Import backup (JSON)
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const text = await file.text();
          try {
            await importAllDataFromJson(text);
            showToast("Backup restored");
          } catch {
            showToast("Import failed — invalid backup file");
          }
          e.target.value = "";
        }}
      />
    </div>
  );
}
