import {
  createContext,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

type ToastInput = {
  title: string;
  message?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastItem = ToastInput & {
  id: number;
  variant: ToastVariant;
  duration: number;
};

type ToastContextValue = {
  showToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toastStyles: Record<ToastVariant, { icon: typeof Info; accent: string; iconClassName: string }> = {
  success: {
    icon: CheckCircle2,
    accent: 'from-emerald-400/40 via-emerald-500/15 to-transparent',
    iconClassName: 'text-emerald-300',
  },
  error: {
    icon: TriangleAlert,
    accent: 'from-rose-400/40 via-rose-500/15 to-transparent',
    iconClassName: 'text-rose-300',
  },
  info: {
    icon: Info,
    accent: 'from-sky-400/40 via-sky-500/15 to-transparent',
    iconClassName: 'text-sky-300',
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextIdRef = useRef(0);
  const timeoutRefs = useRef(new Map<number, number>());

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast: ({ duration = 4200, variant = 'info', ...toast }) => {
        const id = nextIdRef.current++;
        setToasts((current) => [...current, { id, duration, variant, ...toast }]);
      },
    }),
    [],
  );

  const removeToast = (id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timeout = timeoutRefs.current.get(id);
    if (timeout) {
      window.clearTimeout(timeout);
      timeoutRefs.current.delete(id);
    }
  };

  const scheduleRemoval = useEffectEvent((toast: ToastItem) => {
    if (timeoutRefs.current.has(toast.id)) return;

    const timeout = window.setTimeout(() => {
      removeToast(toast.id);
    }, toast.duration);

    timeoutRefs.current.set(toast.id, timeout);
  });

  useEffect(() => {
    toasts.forEach((toast) => {
      scheduleRemoval(toast);
    });
  }, [scheduleRemoval, toasts]);

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timeout) => window.clearTimeout(timeout));
      timeoutRefs.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[120] flex justify-end sm:inset-x-auto sm:right-4 sm:bottom-4">
        <div className="pointer-events-auto w-full max-w-sm space-y-3">
          <AnimatePresence initial={false}>
            {toasts.map((toast) => {
              const { icon: Icon, accent, iconClassName } = toastStyles[toast.variant];

              return (
                <motion.div
                  key={toast.id}
                  layout
                  initial={{ opacity: 0, y: -18, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/85 p-4 shadow-[0_22px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
                >
                  <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${accent}`} />
                  <div className="relative flex items-start gap-3">
                    <div className="mt-0.5 rounded-full border border-white/10 bg-white/5 p-2">
                      <Icon className={`h-4 w-4 ${iconClassName}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black tracking-[0.08em] text-white uppercase">{toast.title}</p>
                      {toast.message && <p className="mt-1 text-xs leading-relaxed text-neutral-300">{toast.message}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeToast(toast.id)}
                      className="rounded-full p-1 text-neutral-500 transition hover:bg-white/5 hover:text-white"
                      aria-label="Fechar notificação"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
