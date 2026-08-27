import { toast, type ToastOptions } from "react-toastify";

const base: ToastOptions = {
  closeButton: true,
};

export function notifySuccess(message: string, options?: ToastOptions) {
  toast.success(message, { ...base, ...options });
}

export function notifyError(message: string, options?: ToastOptions) {
  toast.error(message, { ...base, ...options });
}

export function notifyInfo(message: string, options?: ToastOptions) {
  toast.info(message, { ...base, ...options });
}

