import { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import { fmtDate } from '../utils/format';

export default function Advisory() {
    const [data, setData] = useState({ recommendations: [], generatedAt: null });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const load = async () => {
        setLoading(true);
        try { const { data } = await api.get('/advisory'); setData(data); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const filtered = filter === 'all' ? data.recommendations : data.recommendations.filter((r) => r.type === filter);
    const counts = data.recommendations.reduce((a, r) => ((a[r.type] = (a[r.type] || 0) + 1), a), {});

    return (
        <div>
            <div className="flex-between">
                <div>
                    <h1 className="page-title">Financial Advisory</h1>
                    <p className="page-subtitle">Personalized recommendations based on your spending patterns {data.generatedAt && ` · Updated ${fmtDate(data.generatedAt)}`}</p>
                </div>
                <button className="btn btn-primary" style={{ width: 'auto' }} onClick={load}>🔄 Refresh</button>
            </div>
            <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                    { key: 'all', label: `All (${data.recommendations.length})` },
                    { key: 'danger', label: `🔴 Urgent (${counts.danger || 0})` },
                    { key: 'warning', label: `🟡 Warnings (${counts.warning || 0})` },
                    { key: 'success', label: `🟢 Positive (${counts.success || 0})` },
                    { key: 'info', label: `🔵 Info (${counts.info || 0})` },
                ].map((f) => (
                    <button key={f.key} className={`btn btn-sm ${filter === f.key ? 'btn-primary' : 'btn-ghost'}`} style={filter === f.key ? { width: 'auto' } : {}} onClick={() => setFilter(f.key)}>{f.label}</button>
                ))}
            </div>
            {loading ? <div className="spinner" /> : filtered.length === 0 ? <div className="card empty">No recommendations in this category</div> : (
                filtered.map((r, i) => (
                    <div key={i} className={`reco-card ${r.type}`}>
                        <div className="reco-title">{r.category.toUpperCase()} · {r.title}</div>
                        <div className="reco-msg">{r.message}</div>
                        <div className="reco-suggestion">👉 {r.suggestion}</div>
                    </div>
                ))
            )}
        </div>
    );
}