import { Platform } from 'react-native';
import { getAuthToken } from './authentication.service';

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
const API_URL = `${BASE_URL}/categories`;

export interface Category {
    id: string;
    title: string;
    category: string;
    description?: string;
    image?: string;
    icon?: string;
    bgColor?: string;
}

export const getAllCategories = async (): Promise<Category[]> => {
    try {
        const token = await getAuthToken();
        const headers: any = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(API_URL, {
            method: 'GET',
            headers: headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to fetch categories (Status: ${response.status})`);
        }
        const data = await response.json();
        const categories = Array.isArray(data) ? data : [];
        return [{ id: 'all', title: 'All', category: 'all', icon: '🌟' } as any, ...categories];
    } catch (error: any) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

export const createCategory = async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
    try {
        const token = await getAuthToken();
        const headers: any = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(categoryData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to create category (Status: ${response.status})`);
        }
        return await response.json();
    } catch (error: any) {
        console.error('Error creating category:', error);
        throw error;
    }
};

export const updateCategory = async (id: string, categoryData: Partial<Category>): Promise<Category> => {
    try {
        const token = await getAuthToken();
        const headers: any = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(categoryData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to update category (Status: ${response.status})`);
        }
        return await response.json();
    } catch (error: any) {
        console.error('Error updating category:', error);
        throw error;
    }
};

export const deleteCategory = async (id: string): Promise<void> => {
    try {
        const token = await getAuthToken();
        const headers: any = {
            'Authorization': `Bearer ${token}`,
        };

        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to delete category (Status: ${response.status})`);
        }
    } catch (error: any) {
        console.error('Error deleting category:', error);
        throw error;
    }
};
