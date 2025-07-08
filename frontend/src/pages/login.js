import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/authContext';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/v1/api/auth/login', form);
      console.log("token:"+ res.data.token);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Error occurred');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {msg && <p>{msg}</p>}
      <input name="email" onChange={handleChange} value={form.email} required />
      <input name="password" type="password" onChange={handleChange} value={form.password} required />
      <button type="submit">Login</button>
    </form>
  );
}