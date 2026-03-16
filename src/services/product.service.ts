import { Platform } from 'react-native';
import { getAuthToken } from './authentication.service';

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
const API_URL = `${BASE_URL}/product`;

export interface Product {
    id: string;
    name: string;
    price: string | number;
    weight: string;
    image: string;
    categoryId: string;
    description?: string;
    stock?: number;
    lowStockThreshold?: number;
}

export const getFilteredProducts = async (category?: string, search?: string, tag?: string): Promise<Product[]> => {
    try {
        const token = await getAuthToken();
        const headers: any = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        let url = API_URL;
        const params = new URLSearchParams();
        if (category && category !== 'all') {
            params.append('category', category);
        }
        if (search) {
            params.append('search', search);
        }
        if (tag) {
            params.append('tag', tag);
        }

        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        console.log('Fetching products from:', url);

        const response = await fetch(url, {
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
        console.error('Error fetching filtered products:', error);
        throw error;
    }
};

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

export const updateProductThreshold = async (productId: string, lowStockThreshold: number): Promise<Product> => {
    try {
        const token = await getAuthToken();
        const headers: any = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/${productId}/threshold`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify({ lowStockThreshold }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to update threshold (Status: ${response.status})`);
        }
        return await response.json();
    } catch (error: any) {
        console.error(`Error updating threshold for product ${productId}:`, error);
        throw error;
    }
};

export const createProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
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
            body: JSON.stringify(productData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to create product (Status: ${response.status})`);
        }
        return await response.json();
    } catch (error: any) {
        console.error('Error creating product:', error);
        throw error;
    }
};
