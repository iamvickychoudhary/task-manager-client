import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBoards,
  createBoard,
  updateBoard,
  deleteBoard,
} from '../store/slices/boardSlice.js';
import BoardCard from '../components/BoardCard.jsx';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast.jsx';

export default function Dashboard() {
  const dispatch = useDispatch();
  const boards = useSelector((s) => s.boards.list || []);
  const [title, setTitle] = useState('');
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch boards on mount
  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const submit = async (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setLoading(true);
    try {
      if (editing) {
        await dispatch(updateBoard({ id: editing._id, updates: { title: trimmedTitle } })).unwrap();
        setToast({ message: 'Board updated successfully!', type: 'success' });
        setEditing(null);
      } else {
        await dispatch(createBoard({ title: trimmedTitle })).unwrap();
        setToast({ message: 'Board created successfully!', type: 'success' });
      }
      setTitle('');
      dispatch(fetchBoards());
    } catch (err) {
      setToast({ message: 'Operation failed!', type: 'error' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirm('Are you sure want to delete this board?')) return;
    setLoading(true);
    try {
      await dispatch(deleteBoard(id)).unwrap();
      setToast({ message: 'Board deleted successfully!', type: 'success' });
      dispatch(fetchBoards());
    } catch (err) {
      setToast({ message: 'Delete failed!', type: 'error' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (board) => {
    setEditing(board);
    setTitle(board.title);
  };

  return (
    <div className="p-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <h1 className="text-3xl mb-4">Boards</h1>

      <form onSubmit={submit} className="mb-6 flex gap-2 flex-wrap">
        <input
          className="p-2 border rounded flex-1 min-w-[200px]"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Board title"
          disabled={loading}
        />
        <button
          className={`p-2 text-white rounded transition-colors ${
            editing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={loading}
        >
          {editing ? 'Update' : 'Create'}
        </button>
      </form>

      {/* Board list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {boards.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">No boards found.</p>
        ) : (
          boards.map((board) => (
            <BoardCard
              key={board._id}
              board={board}
              onOpen={() => navigate(`/board/${board._id}`)}
              onDelete={() => onDelete(board._id)}
              onEdit={() => onEdit(board)}
            />
          ))
        )}
      </div>
    </div>
  );
}
