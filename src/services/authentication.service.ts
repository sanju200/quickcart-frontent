import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform } from 'react-native';

// Android emulator uses 10.0.2.2 to access host machine's localhost
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
const API_URL = `${BASE_URL}/auth`;

export interface UserData {
    id: string;
    name: string;
    email: string;
    phone?: string;
    addresses?: string;
}

export const loginUser = async (email: string, password: string) => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        await AsyncStorage.setItem('authToken', data.access_token || data.token);
        // Store user data from the login response
        const userData: UserData = {
            id: data.user?.id || data.id || '',
            name: data.user?.name || data.name || email.split('@')[0],
            email: data.user?.email || data.email || email,
            phone: data.user?.phone || data.phone || '',
            addresses: data.user?.address || data.address || '',
        };
        await saveUserData(userData);
        return data;
    } catch (error: any) {
        throw new Error(error.message || 'An error occurred during login');
    }
};

export const signupUser = async (name: string, email: string, password: string) => {
    try {
        const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Signup failed');
        }
        return data;
    } catch (error: any) {
        throw new Error(error.message || 'An error occurred during signup');
    }
};

export const logoutUser = async () => {
    try {
        await AsyncStorage.multiRemove(['authToken', 'userData']);
    } catch (error) {
        console.error('Error during logout:', error);
    }
};

export const getAuthToken = async () => {
    try {
        return await AsyncStorage.getItem('authToken');
    } catch (error) {
        return null;
    }
};

export const saveUserData = async (userData: UserData) => {
    try {
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
        console.error('Error saving user data:', error);
    }
};

export const getUserData = async (): Promise<UserData | null> => {
    try {
        const data = await AsyncStorage.getItem('userData');
        return data ? JSON.parse(data) : null;
    } catch (error) {
        return null;
    }
};
