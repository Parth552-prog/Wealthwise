import { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import Modal from '../components/Modal';
import { fmtCurrency, fmtDate } from '../utils/format';

const emptyForm = { title: '', targetAmount: '', deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), priority: 'medium' };

export default function Goals() {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [contributeGoal, setContributeGoal] = useState(null);
    const [contributeAmt, setContributeAmt] = useState('');
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        try { const { data } = await api.get('/goals'); setGoals(data); }
        catch (e) { setError(e.response?.data?.message || 'Failed to load goals'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => { setForm(emptyForm); setError(''); setModalOpen(true); };

    const submit = async (e) => {
        e.preventDefault(); setError('');
        try { await api.post('/goals', { ...form, targetAmount: Number(form.targetAmount) }); setModalOpen(false); await load(); }
        catch (e) { setError(e.response?.data?.message || 'Save failed'); }
    };

    const del = async (id) => {
        if (!window.confirm('Delete this goal?')) return;
        try { await api.delete(`/goals/${id}`); await load(); }
        catch (e) { alert(e.response?.data?.message || 'Delete failed'); }
    };

    const contribute = async (e) => {
        e.preventDefault();
        try { await api.post(`/goals/${contributeGoal._id}/contribute`, { amount: Number(contributeAmt) }); setContributeGoal(null); setContributeAmt(''); await load(); }
        catch (err) { alert(err.response?.data?.message || 'Failed'); }
    };

    return (
        <div>
            <div className="flex-between">
                <div><h1 className="page-title">Financial Goals</h1><p className="page-subtitle">Save toward what matters</p></div>
                <button className="btn btn-primary" style={{ width: 'auto' }} onClick={openCreate}>+ New Goal</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            {loading ? <div className="spinner" /> : goals.length === 0 ? <div className="card empty">No goals yet. Create your first goal!</div> : (
                <div className="stat-grid">
                    {goals.map((g) => {
                        const pct = Math.min(100, g.progressPercent || Math.round((g.savedAmount / g.targetAmount) * 100));
                        const cls = g.status === 'completed' ? 'success' : pct >= 75 ? 'warning' : '';
                        const daysLeft = Math.ceil((new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                        return (
                            <div key={g._id} className="card">
                                <div className="flex-between" style={{ marginBottom: 8 }}>
                                    <strong style={{ fontSize: 15 }}>{g.title}</strong>
                                    <span className={`badge badge-${g.status === 'completed' ? 'completed' : 'active'}`}>{g.status}</span>
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 8 }}>{fmtCurrency(g.savedAmount)} of {fmtCurrency(g.targetAmount)} · {g.priority} priority</div>
                                <div className="progress-track"><div className={`progress-fill ${cls}`} style={{ width: `${pct}%` }} /></div>
                                <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-light)' }}>
                                    {pct}% complete · Deadline {fmtDate(g.deadline)} {daysLeft >= 0 && g.status !== 'completed' && ` · ${daysLeft} days left`}
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                                    {g.status !== 'completed' && <button className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={() => { setContributeGoal(g); setContributeAmt(''); }}>+ Add savings</button>}
                                    <button className="btn btn-danger btn-sm" onClick={() => del(g._id)}>Delete</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            <Modal open={modalOpen} title="New Financial Goal" onClose={() => setModalOpen(false)}>
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={submit}>
                    <div className="form-group"><label>Goal Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
                    <div className="form-group"><label>Target Amount (₹)</label><input type="number" min="1" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} required /></div>
                    <div className="form-group"><label>Deadline</label><input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required /></div>
                    <div className="form-group"><label>Priority</label><select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
                    <div className="modal-actions"><button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button><button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>Create</button></div>
                </form>
            </Modal>
            <Modal open={!!contributeGoal} title={`Add savings to "${contributeGoal?.title}"`} onClose={() => setContributeGoal(null)}>
                <form onSubmit={contribute}>
                    <div className="form-group"><label>Amount (₹)</label><input type="number" min="1" value={contributeAmt} onChange={(e) => setContributeAmt(e.target.value)} required /></div>
                    <div className="modal-actions"><button type="button" className="btn btn-ghost" onClick={() => setContributeGoal(null)}>Cancel</button><button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>Add</button></div>
                </form>
            </Modal>
        </div>
    );
}