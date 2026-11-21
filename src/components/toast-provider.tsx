import { Toast } from "@base-ui/react/toast";
import { IconX } from "@tabler/icons-react";
import { createContext, type ReactNode, useContext } from "react";
import { FOCUS, POPUP } from "./styles";

interface ToastOptions {
  title: string;
  description?: string;
  type?: "success" | "error" | "warning" | "info";
}

const ToastContext = createContext<{
  add: (options: ToastOptions) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <Toast.Provider>
      <ToastInner>{children}</ToastInner>
    </Toast.Provider>
  );
}

/** The dot beside a toast's title, colored by its type. */
const TOAST_DOT_CLASS: Record<string, string> = {
  success: "bg:diff-add",
  error: "bg:diff-remove",
  warning: "bg:warning",
  info: "bg:accent",
};

function toastDotClass(type: string | undefined) {
  return TOAST_DOT_CLASS[type ?? "info"] ?? TOAST_DOT_CLASS.info;
}

function ToastItem({ toast }: { toast: Toast.Root.ToastObject }) {
  const dot = toastDotClass(toast.type);

  return (
    <Toast.Root
      toast={toast}
      className={`toast-root p:r d:f fd:c g:1 w:72 pl:4 pr:10 py:3 ${POPUP}`}
    >
      <Toast.Title className="d:f ai:c g:2 m:0 fs:sm fw:600 c:label">
        <span className={`fs:0 w:2 h:2 br:9999 ${dot}`} aria-hidden="true" />
        {toast.title}
      </Toast.Title>
      {toast.description && (
        <Toast.Description className="m:0 pl:4 fs:sm lh:4 c:hint">
          {toast.description}
        </Toast.Description>
      )}
      <Toast.Close
        aria-label="Dismiss"
        className={`p:a t:2 r:2 d:f ai:c jc:c w:6 h:6 p:0 bg:transparent bw:0 br:9999 c:p c:hint h:c:label h:bg:well ${FOCUS}`}
      >
        <IconX size={13} stroke={2} className="fs:0" />
      </Toast.Close>
    </Toast.Root>
  );
}

function ToastInner({ children }: { children: ReactNode }) {
  const { add, toasts } = Toast.useToastManager();

  return (
    <ToastContext.Provider value={{ add }}>
      {children}
      <Toast.Viewport className="p:f t:12 l:50% ttx:-half @lg:ml:-36 zi:60 d:f fd:c g:2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </Toast.Viewport>
    </ToastContext.Provider>
  );
}
