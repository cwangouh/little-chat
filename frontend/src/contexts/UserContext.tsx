// contexts/UserContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthFetch } from '../fetches/auth';

export interface User {
    user_id: number;
    first_name: string;
    surname: string;
    tag: string;
    bio?: string;
}

interface UserContextType {
    currentUser: User | null;
    isLoading: boolean;
    error: string | null;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within UserProvider');
    }
    return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const authFetch = useAuthFetch();

    const loadCurrentUser = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await authFetch('http://localhost:8000/api/v1/user/me', {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to load user data');
            }

            const userData = await response.json();
            setCurrentUser(userData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load user data');
            console.error('Error loading user:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCurrentUser();
    }, []);

    const logout = async () => {
        try {
            await authFetch('http://localhost:8000/api/v1/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
            setCurrentUser(null);
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    return (
        <UserContext.Provider value={{
            currentUser,
            isLoading,
            error,
            refreshUser: loadCurrentUser,
            logout,
        }}>
            {children}
        </UserContext.Provider>
    );
};