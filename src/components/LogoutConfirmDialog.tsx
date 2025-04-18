import React from 'react';

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutConfirmDialog({ onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
        <h3 className="text-lg font-semibold mb-4">Confirm Logout</h3>
        <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
