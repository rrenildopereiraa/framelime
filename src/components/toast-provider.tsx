import { Toast } from "@base-ui/react/toast";
import { IconX } from "@tabler/icons-react";
import { createContext, type ReactNode, useContext } from "react";
import { FOCUS, POPUP } from "./styles";

interface ToastOptions {
  title: string;
  description?: string;
  type?: "success" | "error" | "warning" | "info";
  /** A button in the toast, which dismisses it once pressed. */
  action?: { label: string; onClick: () => void };
}

const ToastContext = createContext<{
  add: (options: ToastOptions) => string;
  close: (id: string) => void;
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
      {toast.actionProps && (
        <div className="pl:4 pt:1">
          <Toast.Action
            className={`d:if ai:c h:7 px:3 bw:1 bs:s bc:rim br:md bg:raised bs-o:key fs:xs fw:500 c:label c:p h:bg:well ${FOCUS}`}
          />
        </div>
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
  const { add: addToast, close, toasts } = Toast.useToastManager();

  function add({ action, ...options }: ToastOptions) {
    let id = "";
    id = addToast({
      ...options,
      actionProps: action
        ? {
            children: action.label,
            onClick: () => {
              action.onClick();
              close(id);
            },
          }
        : undefined,
    });
    return id;
  }

  return (
    <ToastContext.Provider value={{ add, close }}>
      {children}
      <Toast.Viewport className="p:f t:12 l:50% ttx:-half @lg:ml:-36 zi:60 d:f fd:c g:2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </Toast.Viewport>
    </ToastContext.Provider>
  );
}
