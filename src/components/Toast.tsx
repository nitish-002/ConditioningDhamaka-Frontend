import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export default function Toast({ message, onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-slide-up z-50">
      <CheckCircle className="h-5 w-5 text-green-400" />
      {message}
    </div>
  );
}
