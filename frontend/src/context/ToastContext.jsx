import { createContext, useContext, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = (message, tone = "error") => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 4000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast ? (
        <div className={`fixed top-4 right-4 z-50 max-w-sm rounded-xl px-4 py-3 text-sm text-white shadow-lg ${toast.tone === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
