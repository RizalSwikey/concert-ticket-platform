import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4500 }) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* Floating Animated Toast Container (Bottom-Right, above inspector) */}
      <div className="fixed bottom-20 right-6 z-50 flex flex-col space-y-3 pointer-events-none max-w-sm sm:max-w-md w-full px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => {
            const config = {
              info: {
                bg: 'bg-void-surface/95 border-iris/40 shadow-iris-glow',
                icon: <Sparkles className="w-4 h-4 text-iris shrink-0" />,
                titleColor: 'text-iris',
                barColor: 'bg-iris'
              },
              success: {
                bg: 'bg-void-surface/95 border-verdant/40 shadow-lg shadow-verdant/10',
                icon: <CheckCircle2 className="w-4 h-4 text-verdant shrink-0" />,
                titleColor: 'text-verdant',
                barColor: 'bg-verdant'
              },
              warning: {
                bg: 'bg-void-surface/95 border-saffron/40 shadow-saffron-glow',
                icon: <AlertTriangle className="w-4 h-4 text-saffron shrink-0" />,
                titleColor: 'text-saffron',
                barColor: 'bg-saffron'
              },
              error: {
                bg: 'bg-void-surface/95 border-red-500/40 shadow-lg shadow-red-950/40',
                icon: <XCircle className="w-4 h-4 text-red-400 shrink-0" />,
                titleColor: 'text-red-400',
                barColor: 'bg-red-500'
              }
            }[toast.type] || {
              bg: 'bg-void-surface/95 border-void-border',
              icon: <Sparkles className="w-4 h-4 text-silver" />,
              titleColor: 'text-bone',
              barColor: 'bg-silver'
            };

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.95 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`pointer-events-auto relative overflow-hidden rounded-2xl border p-4 backdrop-blur-2xl ${config.bg}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">{config.icon}</div>
                  <div className="flex-1 space-y-0.5 text-xs">
                    {toast.title && (
                      <h4 className={`font-mono font-semibold tracking-wide uppercase text-[11px] ${config.titleColor}`}>
                        {toast.title}
                      </h4>
                    )}
                    <p className="text-bone/90 font-light leading-snug">{toast.message}</p>
                  </div>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="p-1 rounded-full text-ash hover:text-bone hover:bg-zinc-800 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Animated Progress Bar */}
                {toast.duration > 0 && (
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                    className={`absolute bottom-0 left-0 h-0.5 ${config.barColor}`}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
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
