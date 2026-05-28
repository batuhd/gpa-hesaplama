import { useEffect } from 'react';

export default function Alert({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-700',
    error: 'bg-red-50 border-red-200 text-red-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  return (
    <div className="fixed top-4 right-4 z-[200] max-w-sm w-full">
      <div className={`${colors[type]} border rounded-lg shadow-lg px-4 py-3 flex items-start gap-3 animate-[slideIn_0.3s_ease-out]`}>
        <div className="flex-1 text-sm font-medium">{message}</div>
        <button onClick={onClose} className="text-current opacity-60 hover:opacity-100 text-lg leading-none">&times;</button>
      </div>
    </div>
  );
}
