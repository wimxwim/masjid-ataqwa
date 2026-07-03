interface SnapCallbacks {
  onSuccess?: (result: Record<string, unknown>) => void;
  onPending?: (result: Record<string, unknown>) => void;
  onError?: (result: Record<string, unknown>) => void;
  onClose?: () => void;
}

interface Window {
  snap?: {
    pay: (token: string, callbacks?: SnapCallbacks) => void;
  };
}
