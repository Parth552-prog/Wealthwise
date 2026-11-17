import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Goals from './pages/Goals';
import Analytics from './pages/Analytics';
import Advisory from './pages/Advisory';

function Page({ children }) {
    return <Layout>{children}</Layout>;
}

export default function App() {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Page><Dashboard /></Page>} />
                <Route path="/transactions" element={<Page><Transactions /></Page>} />
                <Route path="/budgets" element={<Page><Budgets /></Page>} />
                <Route path="/goals" element={<Page><Goals /></Page>} />
                <Route path="/analytics" element={<Page><Analytics /></Page>} />
                <Route path="/advisory" element={<Page><Advisory /></Page>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}