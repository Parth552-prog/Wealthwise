import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid, BarChart, Bar } from 'recharts';
import api from '../api/axiosInstance';
import { fmtCurrency } from '../utils/format';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Analytics() {
    const [categories, setCategories] = useState({ total: 0, breakdown: [] });
    const [trend, setTrend] = useState([]);
    const [topDays, setTopDays] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [c, t, d] = await Promise.all([api.get('/analytics/categories'), api.get('/analytics/trend?months=6'), api.get('/analytics/top-days')]);
                setCategories(c.data); setTrend(t.data); setTopDays(d.data);
            } finally { setLoading(false); }
        })();
    }, []);

    if (loading) return <div className="spinner" />;

    return (
        <div>
            <h1 className="page-title">Analytics</h1>
            <p className="page-subtitle">Understand your spending patterns</p>
            <div className="grid-2" style={{ marginBottom: 20 }}>
                <div className="card">
                    <div className="card-title">Income / Expense / Savings Trend</div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip formatter={(v) => fmtCurrency(v)} /><Legend />
                            <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} name="Income" />
                            <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2.5} name="Expense" />
                            <Line type="monotone" dataKey="savings" stroke="#4f46e5" strokeWidth={2.5} name="Savings" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="card">
                    <div className="card-title">Spending by Category</div>
                    {categories.breakdown.length === 0 ? <div className="empty">No expenses recorded</div> : (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={categories.breakdown} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={100} label={(e) => e.category}>
                                    {categories.breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie><Tooltip formatter={(v) => fmtCurrency(v)} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
            <div className="grid-2">
                <div className="card">
                    <div className="card-title">Top Spending Days</div>
                    {topDays.length === 0 ? <div className="empty">No data</div> : (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={topDays}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip formatter={(v) => fmtCurrency(v)} />
                                <Bar dataKey="total" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Spent" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
                <div className="card">
                    <div className="card-title">Category Breakdown (Detailed)</div>
                    <div className="table-wrap">
                        <table>
                            <thead><tr><th>Category</th><th>Total</th><th>Txns</th><th>Share</th></tr></thead>
                            <tbody>
                                {categories.breakdown.length === 0 ? <tr><td colSpan="4" className="empty">No data</td></tr> : (
                                    categories.breakdown.map((c) => (
                                        <tr key={c.category}><td><strong>{c.category}</strong></td><td>{fmtCurrency(c.total)}</td><td>{c.count}</td><td>{c.percent}%</td></tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}