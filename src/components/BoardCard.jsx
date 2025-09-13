import React from 'react';

export default function BoardCard({ board, onOpen, onDelete, onEdit }) {
  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{board.title || board.name || 'Untitled'}</h3>
          <p className="text-sm text-gray-500">{board.description}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onEdit(board)} className="text-sm text-indigo-600">Edit</button>
          <button onClick={() => onDelete(board._id)} className="text-sm text-red-600">Delete</button>
        </div>
      </div>
      <div className="mt-3">
        <button onClick={() => onOpen(board._id)} className="text-sm text-white bg-blue-600 px-2 py-1 rounded">Open</button>
      </div>
    </div>
  );
}
