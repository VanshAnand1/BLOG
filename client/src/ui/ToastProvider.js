import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

/** Context + hook */
const ToastCtx = createContext(null);
export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

/** Provider + viewport */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(1);

  const remove = useCallback((id) => {
    setToasts((xs) => xs.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (msg, opts = {}) => {
      const id = idRef.current++;
      const toast = {
        id,
        msg,
        type: opts.type || "info", // "info" | "success" | "warning" | "error"
        duration: opts.duration ?? 4000, // ms; set 0 to require manual close
      };
      setToasts((xs) => [...xs, toast]);
      if (toast.duration > 0) {
        const timer = setTimeout(() => remove(id), toast.duration);
        void timer;
      }
      return id;
    },
    [remove]
  );

  const api = useMemo(
    () => ({
      push,
      info: (m, o) => push(m, { ...o, type: "info" }),
      success: (m, o) => push(m, { ...o, type: "success" }),
      warning: (m, o) => push(m, { ...o, type: "warning" }),
      error: (m, o) => push(m, { ...o, type: "error" }),
      remove,
    }),
    [push, remove]
  );

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} remove={remove} />
    </ToastCtx.Provider>
  );
}

function ToastViewport({ toasts, remove }) {
  return (
    <div
      className="
        fixed inset-x-0 bottom-3 z-[120]
        flex flex-col items-center px-3 space-y-2
        lg:items-end lg:space-y-3 lg:bottom-6 lg:right-6
        pointer-events-none
      "
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={
            "pointer-events-auto w-full max-w-sm rounded-xl border p-3 shadow-lg " +
            "transition transform animate-[toast-in_160ms_ease-out] " +
            (t.type === "success"
              ? "bg-green-500/15 border-green-400/30 text-green-100"
              : t.type === "error"
              ? "bg-red-500/15 border-red-400/30 text-red-100"
              : t.type === "warning"
              ? "bg-yellow-500/15 border-yellow-400/30 text-yellow-100"
              : "bg-white/10 border-white/15 text-aliceblue")
          }
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4m0 4h.01" />
              </svg>
            </span>
            <div className="flex-1 text-sm">{t.msg}</div>
            <button
              onClick={() => remove(t.id)}
              className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-white/10"
              aria-label="Dismiss"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
