import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmDialog({ onConfirm, onCancel }: DeleteConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <h3 className="text-lg font-semibold">Remove Item</h3>
        </div>
        <p className="text-slate-600 mb-6">Are you sure you want to remove this item from cart?</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
