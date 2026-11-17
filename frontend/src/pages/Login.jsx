import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: 'demo@wealthwise.com', password: 'password123' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        try { await login(form.email, form.password); navigate('/'); }
        catch (err) { setError(err.response?.data?.message || 'Login failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-logo">💰 WealthWise</div>
                <h1>Welcome back</h1>
                <p className="subtitle">Sign in to manage your finances</p>
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                    <div className="form-group"><label>Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
                    <button className="btn btn-primary" disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</button>
                </form>
                <p style={{ textAlign: 'center', marginTop: 18, fontSize: 14, color: 'var(--text-light)' }}>No account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Register</Link></p>
            </div>
        </div>
    );
}