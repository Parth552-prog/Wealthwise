import { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import Modal from '../components/Modal';
import { fmtCurrency, MONTHS, CATEGORIES } from '../utils/format';

const now = new Date();
const emptyForm = { category: 'Food', limit: '', month: now.getMonth() + 1, year: now.getFullYear() };

export default function Budgets() {
    const [data, setData] = useState({ budgets: [], month: now.getMonth() + 1, year: now.getFullYear() });
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);

    const load = async (month, year) => {
        setLoading(true);
        try {
            const { data: res } = await api.get(`/budgets?month=${month}&year=${year}`);
            setData(res);
        } catch (e) { setError(e.response?.data?.message || 'Failed to load budgets'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(data.month, data.year); }, [data.month, data.year]);

    const openCreate = () => { setEditingId(null); setForm({ ...emptyForm, month: data.month, year: data.year }); setError(''); setModalOpen(true); };
    const openEdit = (b) => { setEditingId(b._id); setForm({ category: b.category, limit: b.limit, month: b.month, year: b.year }); setError(''); setModalOpen(true); };

    const submit = async (e) => {
        e.preventDefault(); setError('');
        try {
            const payload = { ...form, limit: Number(form.limit), month: Number(form.month), year: Number(form.year) };
            if (editingId) await api.put(`/budgets/${editingId}`, payload);
            else await api.post('/budgets', payload);
            setModalOpen(false); await load(data.month, data.year);
        } catch (e) { setError(e.response?.data?.message || 'Save failed'); }
    };

    const del = async (id) => {
        if (!window.confirm('Delete this budget?')) return;
        try { await api.delete(`/budgets/${id}`); await load(data.month, data.year); }
        catch (e) { alert(e.response?.data?.message || 'Delete failed'); }
    };

    return (
        <div>
            <div className="flex-between">
                <div><h1 className="page-title">Budgets</h1><p className="page-subtitle">Set monthly category limits and track spending</p></div>
                <button className="btn btn-primary" style={{ width: 'auto' }} onClick={openCreate}>+ New Budget</button>
            </div>
            <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <select value={data.month} onChange={(e) => setData({ ...data, month: Number(e.target.value) })} style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--border)' }}>
                    {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
                <select value={data.year} onChange={(e) => setData({ ...data, year: Number(e.target.value) })} style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--border)' }}>
                    {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            {loading ? <div className="spinner" /> : data.budgets.length === 0 ? <div className="card empty">No budgets for this month. Click "New Budget" to create one.</div> : (
                <div className="stat-grid">
                    {data.budgets.map((b) => {
                        const pct = Math.min(100, b.percentUsed || 0);
                        const cls = pct >= 100 ? 'danger' : pct >= 80 ? 'warning' : 'success';
                        return (
                            <div key={b._id} className="card">
                                <div className="flex-between" style={{ marginBottom: 8 }}>
                                    <strong style={{ fontSize: 15 }}>{b.category}</strong>
                                    <span className={`badge badge-${cls}`}>{pct}% used</span>
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text-light)' }}>{fmtCurrency(b.spent)} of {fmtCurrency(b.limit)}</div>
                                <div className="progress-track"><div className={`progress-fill ${cls}`} style={{ width: `${pct}%` }} /></div>
                                <div style={{ marginTop: 6, fontSize: 13 }}>
                                    {b.remaining >= 0 ? <span style={{ color: 'var(--success)' }}>₹{b.remaining.toLocaleString('en-IN')} left</span> : <span style={{ color: 'var(--danger)' }}>Over by ₹{Math.abs(b.remaining).toLocaleString('en-IN')}</span>}
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(b)}>Edit</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => del(b._id)}>Delete</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            <Modal open={modalOpen} title={editingId ? 'Edit Budget' : 'New Budget'} onClose={() => setModalOpen(false)}>
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={submit}>
                    <div className="form-group"><label>Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.expense.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div className="form-group"><label>Monthly Limit (₹)</label><input type="number" min="1" value={form.limit} onChange={(e) => setForm({ ...form, limit: e.target.value })} required /></div>
                    <div className="form-group"><label>Month</label><select value={form.month} onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}>{MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}</select></div>
                    <div className="form-group"><label>Year</label><input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} required /></div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>{editingId ? 'Update' : 'Create'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}