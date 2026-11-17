import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts';
import api from '../api/axiosInstance';
import StatCard from '../components/StatCard';
import { fmtCurrency } from '../utils/format';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [trend, setTrend] = useState([]);
    const [categories, setCategories] = useState([]);
    const [reco, setReco] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [s, t, c, r] = await Promise.all([
                    api.get('/analytics/summary'), api.get('/analytics/trend?months=6'),
                    api.get('/analytics/categories'), api.get('/advisory')
                ]);
                setSummary(s.data); setTrend(t.data);
                setCategories(c.data.breakdown.slice(0, 6)); setReco(r.data.recommendations.slice(0, 3));
            } finally { setLoading(false); }
        })();
    }, []);

    if (loading) return <div className="spinner" />;
    if (!summary) return <div className="empty">No data yet</div>;

    return (
        <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Overview of your finances this month</p>
            <div className="stat-grid">
                <StatCard variant="income" label="Income (This Month)" value={fmtCurrency(summary.monthIncome)} />
                <StatCard variant="expense" label="Expenses (This Month)" value={fmtCurrency(summary.monthExpense)} />
                <StatCard variant="savings" label="Savings (This Month)" value={fmtCurrency(summary.monthBalance)} hint={`Savings rate: ${summary.savingsRate}%`} />
                <StatCard variant="balance" label="Total Balance (All Time)" value={fmtCurrency(summary.totalBalance)} />
            </div>
            <div className="grid-2">
                <div className="card">
                    <div className="card-title">Income vs Expenses (Last 6 Months)</div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={trend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip formatter={(v) => fmtCurrency(v)} /><Legend />
                            <Bar dataKey="income" fill="#10b981" name="Income" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="card">
                    <div className="card-title">Top Spending Categories</div>
                    {categories.length === 0 ? <div className="empty">No expenses yet</div> : (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie data={categories} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={95} label={(e) => e.category}>
                                    {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie><Tooltip formatter={(v) => fmtCurrency(v)} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
            <div className="card" style={{ marginTop: 20 }}>
                <div className="card-title">💡 Personalized Tips</div>
                {reco.length === 0 ? <div className="empty">Add more data to unlock recommendations</div> : (
                    reco.map((r, i) => (
                        <div key={i} className={`reco-card ${r.type}`}>
                            <div className="reco-title">{r.title}</div>
                            <div className="reco-msg">{r.message}</div>
                            <div className="reco-suggestion">👉 {r.suggestion}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}