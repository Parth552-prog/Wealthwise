import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('ww_user');
        if (stored) {
            try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('ww_user'); }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('ww_user', JSON.stringify(data));
        setUser(data);
    };

    const register = async (payload) => {
        const { data } = await api.post('/auth/register', payload);
        localStorage.setItem('ww_user', JSON.stringify(data));
        setUser(data);
    };

    const logout = () => {
        localStorage.removeItem('ww_user');
        setUser(null);
    };

    return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);