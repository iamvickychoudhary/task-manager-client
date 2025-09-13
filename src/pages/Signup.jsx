import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { register } from '../store/slices/authSlice.js';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(register({ name, email, password })).unwrap();
      navigate('/');
    } catch (err) { alert(err?.message || 'Signup failed'); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-md p-6 bg-white rounded shadow">
        <h2 className="text-2xl mb-4">Sign up</h2>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="w-full mb-3 p-2 border rounded" />
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full mb-3 p-2 border rounded" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full mb-3 p-2 border rounded" />
        <button className="w-full p-2 bg-green-600 text-white rounded">Create account</button>
        <p className="mt-3 text-sm">Have account? <Link to="/login" className="text-blue-600">Login</Link></p>
      </form>
    </div>
  );
}
