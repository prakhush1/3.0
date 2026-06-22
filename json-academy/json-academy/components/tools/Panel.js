import Icon from "@/components/Icon";

export function Field({ label, action, children }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold" style={{ color: "var(--color-sub)" }}>{label}</p>
        {action}
      </div>
      {children}
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <p className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
      <Icon name="zap" className="w-3.5 h-3.5 shrink-0" /> {message}
    </p>
  );
}

export const taClass =
  "h-64 w-full resize-none rounded-lg border p-4 font-mono text-[13px] text-gray-200 outline-none transition-colors";

export const taStyle = {
  borderColor: "var(--color-line)",
  backgroundColor: "#0d1117",
};

export const taFocusStyle = {
  borderColor: "var(--color-brand)",
};

export const taLightClass =
  "h-64 w-full resize-none rounded-lg border p-4 font-mono text-[13px] outline-none transition-colors";

export const taLightStyle = {
  borderColor: "var(--color-line)",
  backgroundColor: "var(--color-brand-50)",
  color: "var(--color-ink)",
};
