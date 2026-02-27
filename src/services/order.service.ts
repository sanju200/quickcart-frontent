import { Platform } from 'react-native';
import { getAuthToken, getUserData } from './authentication.service';
import { Product } from './product.service';

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
const API_URL = `${BASE_URL}/order`;
const ORDERS_STORAGE_KEY = 'quickcart_orders_history';

export interface OrderItem {
    id: string;
    orderId?: string;
    productId?: string;
    productTitle: string;
    productImage: string;
    quantity: number;
    price: string;
    totalAmount: string;
    priceAtPurchase?: number;
    product?: Product; // Populated for UI convenience if available
}

export type OrderStatus = 'PLACED' | 'DELIVERED' | 'CANCELLED' | 'PENDING';

export interface Order {
    id: string;
    userId?: string;
    userName?: string;
    userEmail?: string;
    userPhone?: string;
    address?: string;
    totalAmount: string;
    status: OrderStatus;
    createdAt?: string;
    created_at?: string;
    updated_at?: string;
    deliveryAddress?: string;
    items: OrderItem[];
}

export const getOrders = async (): Promise<Order[]> => {
    try {
        const user = await getUserData();
        if (!user || !user.id) return [];

        const token = await getAuthToken();
        const headers: any = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/user/${user.id}`, {
            method: 'GET',
            headers: headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to fetch orders (Status: ${response.status})`);
        }

        const orders = await response.json();

        // Normalize and sort by latest first
        return orders.map((o: any) => ({
            ...o,
            createdAt: o.createdAt || o.created_at // Handle both for safety
        })).sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    } catch (error: any) {
        console.error('Error fetching orders from API:', error);
        return [];
    }
};

export const createOrder = async (orderData: any): Promise<Order> => {
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
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to place order (Status: ${response.status})`);
        }

        const createdOrder = await response.json();
        return createdOrder;
    } catch (error: any) {
        console.error('Error creating order:', error);
        throw error;
    }
};

export const getOrderDetails = async (orderId: string): Promise<Order> => {
    try {
        const orders = await getOrders();
        const order = orders.find(o => o.id === orderId);
        if (!order) throw new Error('Order not found');
        return order;
    } catch (error: any) {
        console.error(`Error fetching order details for ${orderId}:`, error);
        throw error;
    }
};
