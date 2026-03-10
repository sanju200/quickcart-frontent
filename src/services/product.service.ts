import { Platform } from 'react-native';
import { getAuthToken } from './authentication.service';

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
const API_URL = `${BASE_URL}/product`;

export interface Product {
    id: string;
    name: string;
    price: string;
    weight: string;
    image: string;
    category: string;
    description?: string;
    stock?: number;
}

export const getAllProducts = async (): Promise<Product[]> => {
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
            throw new Error(errorData.message || `Failed to fetch products (Status: ${response.status})`);
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error: any) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
    try {
        const token = await getAuthToken();
        const headers: any = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/category/${category}`, {
            method: 'GET',
            headers: headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to fetch category products (Status: ${response.status})`);
        }
        const data = await response.json();
        return data;
    } catch (error: any) {
        console.error(`Error fetching products for category ${category}:`, error);
        throw error;
    }
};

export const updateProductStock = async (productId: string, stock: number): Promise<Product> => {
    try {
        const token = await getAuthToken();
        const headers: any = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/${productId}/stock`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify({ stock }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to update stock (Status: ${response.status})`);
        }
        return await response.json();
    } catch (error: any) {
        console.error(`Error updating stock for product ${productId}:`, error);
        throw error;
    }
};
