import { Platform } from 'react-native';
import { getAuthToken } from './authentication.service';

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
const API_URL = `${BASE_URL}/offer`;

export interface Offer {
    id: string;
    title: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    description?: string;
    expiresAt?: string;
    isActive: boolean;
    image?: string;
}

export const getAllOffers = async (): Promise<Offer[]> => {
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
            throw new Error(errorData.message || `Failed to fetch offers (Status: ${response.status})`);
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error: any) {
        console.error('Error fetching offers:', error);
        throw error;
    }
};

export const createOffer = async (offerData: Omit<Offer, 'id'>): Promise<Offer> => {
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
            body: JSON.stringify(offerData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to create offer (Status: ${response.status})`);
        }
        return await response.json();
    } catch (error: any) {
        console.error('Error creating offer:', error);
        throw error;
    }
};

export const deleteOffer = async (id: string): Promise<void> => {
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
            throw new Error(errorData.message || `Failed to delete offer (Status: ${response.status})`);
        }
    } catch (error: any) {
        console.error('Error deleting offer:', error);
        throw error;
    }
};
