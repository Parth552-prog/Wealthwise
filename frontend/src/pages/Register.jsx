import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', monthlyIncome: 50000 });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        try { await register({ ...form, monthlyIncome: Number(form.monthlyIncome) }); navigate('/'); }
        catch (err) { setError(err.response?.data?.message || 'Registration failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-logo">💰 WealthWise</div>
                <h1>Create account</h1>
                <p className="subtitle">Start managing your finances today</p>
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group"><label>Full Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                    <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                    <div className="form-group"><label>Password (min 6 chars)</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} required /></div>
                    <div className="form-group"><label>Monthly Income (₹)</label><input type="number" value={form.monthlyIncome} onChange={(e) => setForm({ ...form, monthlyIncome: e.target.value })} min={0} required /></div>
                    <button className="btn btn-primary" disabled={loading}>{loading ? 'Creating…' : 'Register'}</button>
                </form>
                <p style={{ textAlign: 'center', marginTop: 18, fontSize: 14, color: 'var(--text-light)' }}>Have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login</Link></p>
            </div>
        </div>
    );
}