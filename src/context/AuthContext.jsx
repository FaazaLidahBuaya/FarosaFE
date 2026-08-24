import { API_BASE_URL } from '../config';
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setUser(res.data);
        } catch (error) {
          console.error(error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data);
  };

  const register = async (name, email, password, phone, usageType, address, location) => {
    const res = await axios.post(`${API_BASE_URL}/api/auth/register`, { name, email, password, phone, usageType, address, location });
    localStorage.setItem('token', res.data.token);
    setUser(res.data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};