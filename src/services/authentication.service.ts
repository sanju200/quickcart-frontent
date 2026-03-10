import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform } from 'react-native';

// Android emulator uses 10.0.2.2 to access host machine's localhost
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
const API_URL = `${BASE_URL}/auth`;

export interface Address {
    type: 'Home' | 'Work' | 'Other';
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isSelected: boolean;
}

export interface UserData {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role?: 'USER' | 'ADMIN' | 'INVENTORY_MANAGER' | 'LOGISTICS_PARTNER' | 'DELIVERY_PARTNER';
    addresses?: Address[];
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
        // Helper to normalize addresses from various formats
        const normalizeAddresses = (addr: any): Address[] => {
            if (Array.isArray(addr)) return addr;
            if (typeof addr === 'string' && addr.trim()) {
                return [{
                    type: 'Home',
                    streetAddress: addr,
                    city: '',
                    state: '',
                    postalCode: '',
                    country: '',
                    isSelected: true
                }];
            }
            return [];
        };

        const userData: UserData = {
            id: data.id || data.user?.id || '',
            name: data.name || data.user?.name || email.split('@')[0],
            email: data.email || data.user?.email || email,
            phone: data.phone || data.user?.phone || '',
            role: data.role || data.user?.role || 'USER',
            addresses: normalizeAddresses(data.addresses || data.user?.addresses || data.address || data.user?.address),
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
        const user = data ? JSON.parse(data) : null;
        if (user && typeof user.addresses === 'string') {
            user.addresses = [{
                type: 'Home',
                streetAddress: user.addresses,
                city: '',
                state: '',
                postalCode: '',
                country: '',
                isSelected: true
            }];
        }
        return user;


    } catch (error) {
        return null;
    }
};


export const updateProfile = async (userData: UserData) => {
    try {
        const token = await getAuthToken();
        const { id, ...updateData } = userData;
        const response = await fetch(`${BASE_URL}/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(updateData),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Update failed');
        }

        // Normalize the response data to match UserData interface before saving
        const normalizeAddresses = (addr: any): Address[] => {
            if (Array.isArray(addr)) return addr;
            if (typeof addr === 'string' && addr.trim()) {
                return [{
                    type: 'Home',
                    streetAddress: addr,
                    city: '',
                    state: '',
                    postalCode: '',
                    country: '',
                    isSelected: true
                }];
            }
            return userData.addresses || [];
        };

        const updatedUser: UserData = {
            id: data.id || userData.id,
            name: data.name || userData.name,
            email: data.email || userData.email,
            phone: data.phone || userData.phone,
            role: data.role || userData.role,
            addresses: normalizeAddresses(data.addresses || data.address),
        };


        await saveUserData(updatedUser);
        return updatedUser;
    } catch (error: any) {
        throw new Error(error.message || 'An error occurred during update');
    }
};

