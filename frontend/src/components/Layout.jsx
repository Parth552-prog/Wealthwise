import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
    { to: '/', label: '📊 Dashboard', end: true },
    { to: '/transactions', label: '💸 Transactions' },
    { to: '/budgets', label: '🎯 Budgets' },
    { to: '/goals', label: '🏆 Goals' },
    { to: '/analytics', label: '📈 Analytics' },
    { to: '/advisory', label: '💡 Advisory' },
];

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <div className="app-layout">
            <aside className={`sidebar ${open ? 'open' : ''}`}>
                <div className="sidebar-logo">Wealth<span>Wise</span></div>
                <nav className="sidebar-nav" onClick={() => setOpen(false)}>
                    {links.map((l) => (
                        <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            {l.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <div className="user-name">{user?.name}</div>
                    <div className="user-email">{user?.email}</div>
                    <button className="logout" onClick={handleLogout}>Logout</button>
                </div>
            </aside>
            <main className="main-content">
                <button className="mobile-menu-btn" onClick={() => setOpen(!open)}>☰</button>
                {children}
            </main>
        </div>
    );
}