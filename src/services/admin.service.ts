import { Platform } from 'react-native';
import { getAuthToken } from './authentication.service';

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
const API_URL = `${BASE_URL}/admin`;

export interface AdminStats {
    totalRevenue: number;
    activeOrders: number;
    totalUsers: number;
    pendingOrders: number;
    lowStockItems: number;
}

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    createdAt?: string;
}

export const getAdminStats = async (): Promise<AdminStats> => {
    try {
        const token = await getAuthToken();
        const response = await fetch(`${API_URL}/stats`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch admin stats: ${response.status}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error('Error fetching admin stats:', error);
        // Return dummy data if API fails during development
        return {
            totalRevenue: 0,
            activeOrders: 0,
            totalUsers: 0,
            pendingOrders: 0,
            lowStockItems: 0
        };
    }
};

export const getAllUsers = async (): Promise<AdminUser[]> => {
    try {
        const token = await getAuthToken();
        const response = await fetch(`${API_URL}/users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch users: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
};

export const deleteUser = async (userId: string): Promise<void> => {
    try {
        const token = await getAuthToken();
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to delete user: ${response.status}`);
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

export const addUser = async (userData: any): Promise<AdminUser> => {
    try {
        const token = await getAuthToken();
        const response = await fetch(`${BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to add user: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error adding user:', error);
        throw error;
    }
};

export const getAdminOrders = async (): Promise<any[]> => {
    try {
        const token = await getAuthToken();
        const response = await fetch(`${API_URL}/orders`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching admin orders:', error);
        return [];
    }
};

export const getLowStockItems = async (): Promise<any[]> => {
    try {
        const token = await getAuthToken();
        const response = await fetch(`${API_URL}/low-stock`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching low stock:', error);
        return [];
    }
};

export const getFleetPartners = async (): Promise<AdminUser[]> => {
    try {
        const token = await getAuthToken();
        const response = await fetch(`${API_URL}/partners`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching partners:', error);
        return [];
    }
};

export const getCommissionStats = async (): Promise<any> => {
    try {
        const token = await getAuthToken();
        const response = await fetch(`${API_URL}/commission-stats`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching commission:', error);
        return { totalCommission: 0, platformRevenue: 0, partnerEarnings: 0, orderCount: 0 };
    }
};
