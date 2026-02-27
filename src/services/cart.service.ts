import { Platform } from 'react-native';
import { getAuthToken, getUserData } from './authentication.service';
import { Product } from './product.service';

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
const API_URL = `${BASE_URL}/cart`;

export interface CartItem {
    id: string;
    productId: string;
    quantity: number;
    product?: Product;
}

export interface Cart {
    items: CartItem[];
    totalAmount: number;
}

const getHeaders = async () => {
    const token = await getAuthToken();
    const headers: any = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

/**
 * Helper to handle the logic: 
 * If new quantity > 0, update item.
 * If new quantity <= 0, remove item.
 */
export async function handleCartQuantityChange(productId: string, newQuantity: number) {
    if (newQuantity <= 0) {
        return await removeFromCart(productId);
    } else {
        return await updateCartQuantity(productId, newQuantity);
    }
}

export const updateCartQuantity = async (productId: string, quantity: number) => {
    try {
        if (!productId) throw new Error('Cannot update item: productId is missing');
        const user = await getUserData();
        if (!user || !user.id) throw new Error('User not logged in');

        const headers = await getHeaders();
        const url = `${API_URL}/${user.id}/update/${productId}`;
        console.log(`[CartService] Updating item: ${url} with quantity: ${quantity}`);

        const response = await fetch(url, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify({ quantity }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to update item quantity (Status: ${response.status})`);
        }
        return await response.json();
    } catch (error: any) {
        console.error('Error updating cart quantity:', error);
        throw error;
    }
};

export const getCart = async (): Promise<CartItem[]> => {
    try {
        const user = await getUserData();
        if (!user || !user.id) return [];

        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/${user.id}`, {
            method: 'GET',
            headers: headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to fetch cart (Status: ${response.status})`);
        }
        const data = await response.json();
        const items = Array.isArray(data) ? data : data.items || [];

        // Normalize items to ensure productId is present (handle various backend field names)
        return items.map((item: any) => ({
            ...item,
            productId: item.productId || item.product?.id || item.product?._id || item.id || item._id
        }));
    } catch (error: any) {
        console.error('Error fetching cart:', error);
        throw error;
    }
};

export const addToCart = async (productId: string, quantity: number = 1) => {
    try {
        const user = await getUserData();
        if (!user || !user.id) throw new Error('User not logged in');

        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/${user.id}/add`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ productId, quantity }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to add item to cart');
        }
        return await response.json();
    } catch (error: any) {
        console.error('Error adding to cart:', error);
        throw error;
    }
};

export const removeFromCart = async (productId: string) => {
    try {
        if (!productId) throw new Error('Cannot remove item: productId is missing');
        const user = await getUserData();
        if (!user || !user.id) throw new Error('User not logged in');

        const headers = await getHeaders();
        const url = `${API_URL}/${user.id}/remove/${productId}`;
        console.log(`[CartService] Removing item: ${url}`);

        const response = await fetch(url, {
            method: 'DELETE',
            headers: headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to remove item from cart (Status: ${response.status})`);
        }
        return await response.json();
    } catch (error: any) {
        console.error('Error removing from cart:', error);
        throw error;
    }
};
export const clearCart = async () => {
    try {
        const user = await getUserData();
        if (!user || !user.id) throw new Error('User not logged in');

        const headers = await getHeaders();
        const url = `${API_URL}/${user.id}/clear`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to clear cart (Status: ${response.status})`);
        }

        // Handle potentially empty response (204 No Content or empty 200)
        const text = await response.text();
        return text ? JSON.parse(text) : {};
    } catch (error: any) {
        console.error('Error clearing cart:', error);
        throw error;
    }
};
