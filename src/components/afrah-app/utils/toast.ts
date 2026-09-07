export type ToastType = 'success' | 'error' | 'info';

export interface ToastPayload {
  message: string;
  type?: ToastType;
}

/**
 * Dispatches a custom 'afrah-toast' event to trigger global toast notifications
 */
export const showToast = (message: string, type: ToastType = 'success'): void => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('afrah-toast', {
        detail: { message, type }
      })
    );
  }
};
