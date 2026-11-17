import { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import Modal from '../components/Modal';
import { fmtCurrency, fmtDate, CATEGORIES } from '../utils/format';

const emptyForm = { type: 'expense', amount: '', category: 'Food', description: '', date: new Date().toISOString().slice(0, 10), paymentMethod: 'upi' };

export default function Transactions() {
    const [items, setItems] = useState([]);
    const [filter, setFilter] = useState({ type: '', category: '' });
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter.type) params.set('type', filter.type);
            if (filter.category) params.set('category', filter.category);
            const { data } = await api.get(`/transactions?${params.toString()}`);
            setItems(data.transactions || []);
        } catch (e) { setError(e.response?.data?.message || 'Failed to load'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [filter.type, filter.category]);

    const openCreate = () => { setEditingId(null); setForm({ ...emptyForm, category: CATEGORIES.expense[0] }); setError(''); setModalOpen(true); };

    const openEdit = (txn) => {
        setEditingId(txn._id);
        setForm({ type: txn.type, amount: txn.amount, category: txn.category, description: txn.description || '', date: new Date(txn.date).toISOString().slice(0, 10), paymentMethod: txn.paymentMethod || 'upi' });
        setError(''); setModalOpen(true);
    };

    const handleTypeChange = (newType) => {
        setForm((f) => ({ ...f, type: newType, category: CATEGORIES[newType][0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true); setError('');
        try {
            const payload = { ...form, amount: Number(form.amount) };
            if (editingId) await api.put(`/transactions/${editingId}`, payload);
            else await api.post('/transactions', payload);
            setModalOpen(false); await load();
        } catch (e) { setError(e.response?.data?.message || 'Save failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this transaction?')) return;
        try { await api.delete(`/transactions/${id}`); await load(); }
        catch (e) { alert(e.response?.data?.message || 'Delete failed'); }
    };

    return (
        <div>
            <div className="flex-between">
                <div><h1 className="page-title">Transactions</h1><p className="page-subtitle">Track all your income and expenses</p></div>
                <button className="btn btn-primary" style={{ width: 'auto' }} onClick={openCreate}>+ Add Transaction</button>
            </div>
            <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <select value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })} style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--border)' }}>
                    <option value="">All types</option><option value="income">Income</option><option value="expense">Expense</option>
                </select>
                <select value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })} style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--border)' }}>
                    <option value="">All categories</option>
                    {[...CATEGORIES.income, ...CATEGORIES.expense].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            {loading ? <div className="spinner" /> : items.length === 0 ? <div className="card empty">No transactions yet. Click "Add Transaction" to start.</div> : (
                <div className="table-wrap">
                    <table>
                        <thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Description</th><th>Amount</th><th>Method</th><th></th></tr></thead>
                        <tbody>
                            {items.map((t) => (
                                <tr key={t._id}>
                                    <td>{fmtDate(t.date)}</td>
                                    <td><span className={`badge badge-${t.type}`}>{t.type}</span></td>
                                    <td>{t.category}</td>
                                    <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description || '—'}</td>
                                    <td className={t.type === 'income' ? 'text-income' : 'text-expense'}>{t.type === 'income' ? '+' : '−'}{fmtCurrency(t.amount)}</td>
                                    <td style={{ textTransform: 'uppercase', fontSize: 12 }}>{t.paymentMethod}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)}>Edit</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t._id)}>Del</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal open={modalOpen} title={editingId ? 'Edit Transaction' : 'Add Transaction'} onClose={() => setModalOpen(false)}>
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Type</label>
                        <select value={form.type} onChange={(e) => handleTypeChange(e.target.value)}>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Amount (₹)</label>
                        <input type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                            {CATEGORIES[form.type].map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional note" />
                    </div>
                    <div className="form-group">
                        <label>Date</label>
                        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Payment Method</label>
                        <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="upi">UPI</option>
                            <option value="netbanking">Net Banking</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={saving}>
                            {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}