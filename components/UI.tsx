"use client";

export function Card({ children, className = "" }: any) {
  return (
    <div className={`rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow ${className}`}>
      {children}
    </div>
  );
}

export function Button({ children, onClick, className = "", type = "button", disabled = false }: any) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-2xl bg-blue-600 px-5 py-3 font-extrabold text-white disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function Input(props: any) {
  return (
    <input
      {...props}
      className={`mt-3 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 ${props.className || ""}`}
    />
  );
}

export function Textarea(props: any) {
  return (
    <textarea
      {...props}
      className={`mt-3 min-h-28 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 ${props.className || ""}`}
    />
  );
}

export function ProgressBar({ label, value }: { label: string; value: number }) {
  const safe = Math.max(0, Math.min(100, value || 0));
  const color = safe >= 70 ? "bg-green-500" : safe >= 40 ? "bg-orange-500" : "bg-red-500";

  return (
    <div className="mb-5">
      <div className="mb-2 flex justify-between">
        <p className="font-bold text-white">{label}</p>
        <p className="text-slate-400">{safe}%</p>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-800">
        <div className={`h-3 rounded-full ${color}`} style={{ width: `${safe}%` }} />
      </div>
    </div>
  );
}
