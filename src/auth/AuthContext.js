import React, { createContext, useContext, useState, useEffect } from 'react';
import { instance } from '../lib/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            checkAuthStatus();
        } else {
            setLoading(false);
        }
    }, [token]);

    const checkAuthStatus = async () => {
        try {
            if (token) {
                instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const userData = JSON.parse(localStorage.getItem('userData'));
                if (userData) {
                    setUser(userData);
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    // Login bằng phone + password
    const login = async (identifier, password) => {
        try {
            const response = await instance.get('/users');
            const users = response.data;

            // Tìm user bằng phone
            const user = users.find(u =>
                (u.phone === identifier) &&
                u.password === password &&
                u.isActive
            );

            if (user) {
                const userData = {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    avatar: user.avatar || '',
                    phone: user.phone,
                    username: user.username
                };

                const mockToken = `mock-token-${user.id}-${Date.now()}`;

                localStorage.setItem('token', mockToken);
                localStorage.setItem('userData', JSON.stringify(userData));

                setToken(mockToken);
                setUser(userData);

                return { success: true, user: userData };
            } else {
                throw new Error('Số điện thoại hoặc mật khẩu không đúng');
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    // Register với role mặc định là student
    const register = async (userData) => {
        try {
            const response = await instance.get('/users');
            const users = response.data;

            // Kiểm tra phone đã tồn tại
            const existingUserByPhone = users.find(u => u.phone === userData.phone);
            if (existingUserByPhone) {
                throw new Error('Số điện thoại đã được sử dụng');
            }

            // Kiểm tra email đã tồn tại
            const existingUserByEmail = users.find(u => u.email === userData.email);
            if (existingUserByEmail) {
                throw new Error('Email đã được sử dụng');
            }

            const newUser = {
                ...userData,
                id: String(users.length > 0 ? Math.max(...users.map(u => parseInt(u.id))) + 1 : 1),
                role: userData.role || 'student', // Cho phép chọn role khi đăng ký
                username: userData.email.split('@')[0],
                createdAt: new Date().toISOString(),
                isActive: true,
                avatar: userData.avatar || ''
            };

            await instance.post('/users', newUser);

            return { success: true, message: 'Đăng ký thành công' };
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        setToken(null);
        setUser(null);
        delete instance.defaults.headers.common['Authorization'];
    };

    const updateProfile = async (profileData) => {
        try {
            await instance.put(`/users/${user.id}`, {
                ...profileData,
                id: user.id
            });

            const updatedUser = { ...user, ...profileData };
            setUser(updatedUser);
            localStorage.setItem('userData', JSON.stringify(updatedUser));

            return { success: true };
        } catch (error) {
            console.error('Profile update failed:', error);
            throw error;
        }
    };

    const value = {
        user,
        login,
        register,
        logout,
        updateProfile,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isTutor: user?.role === 'tutor',
        isStudent: user?.role === 'student'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthProvider;