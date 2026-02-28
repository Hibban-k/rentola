/**
 * API Client - Centralized helper functions for backend API calls
 */

import {
    Vehicle,
    VehicleFilters,
    Rental,
    CreateRentalPayload,
    CreateVehiclePayload,
    SignupPayload,
    AuthResponse,
    Provider,
    UserInfo,
    VehicleImage
} from "@/types";

const API_BASE = "";

// Helper to build headers
const getHeaders = (): HeadersInit => {
    return {
        "Content-Type": "application/json",
    };
};

// Generic API response type
interface ApiResponse<T> {
    data?: T;
    error?: string;
}

// Generic fetch wrapper
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                ...getHeaders(),
                ...options.headers,
            },
        });

        const data = await res.json();

        if (!res.ok) {
            return { error: data.error || data.message || "Request failed" };
        }

        return { data };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Network error" };
    }
}

// ============================================
// AUTH APIs
// ============================================

export const authApi = {
    // Signup new user
    signup: (payload: SignupPayload) =>
        apiFetch<AuthResponse>("/api/auth/signup", {
            method: "POST",
            body: JSON.stringify(payload),
        }),
};

// ============================================
// VEHICLES APIs (Public)
// ============================================

export const vehiclesApi = {
    // List all available vehicles
    list: (filters?: VehicleFilters) => {
        const params = new URLSearchParams();
        if (filters?.type) params.set("type", filters.type);
        if (filters?.search) params.set("search", filters.search);
        if (filters?.minPrice) params.set("minPrice", String(filters.minPrice));
        if (filters?.maxPrice) params.set("maxPrice", String(filters.maxPrice));
        if (filters?.page) params.set("page", String(filters.page));
        if (filters?.limit) params.set("limit", String(filters.limit));

        const query = params.toString();
        return apiFetch<{ vehicles: Vehicle[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(`/api/vehicles${query ? `?${query}` : ""}`);
    },

    // Get single vehicle
    get: (id: string) =>
        apiFetch<{ vehicle: Vehicle & { owner?: { name: string } } }>(`/api/vehicles/${id}`),
};

// ============================================
// RENTALS APIs (User)
// ============================================

export const rentalsApi = {
    // Get user's rentals
    list: () =>
        apiFetch<{ rentals: Rental[] }>("/api/users/rentals"),

    // Create a new rental
    create: (payload: CreateRentalPayload) =>
        apiFetch<{ success: boolean; message: string }>(
            "/api/users/rentals",
            {
                method: "POST",
                body: JSON.stringify(payload),
            }
        ),
};

// ============================================
// PROVIDER APIs
// ============================================

export const providerApi = {
    // Get provider's vehicles
    getVehicles: () =>
        apiFetch<{ vehicles: Vehicle[] }>("/api/provider/vehicles"),

    // Get single vehicle
    getVehicle: (id: string) =>
        apiFetch<{ vehicle: Vehicle }>(`/api/provider/vehicles/${id}`),

    // Create a vehicle
    createVehicle: (payload: CreateVehiclePayload) =>
        apiFetch<{ success: boolean; message: string }>(
            "/api/provider/createVehicle",
            {
                method: "POST",
                body: JSON.stringify(payload),
            }
        ),

    // Update vehicle (availability, etc.)
    updateVehicle: (id: string, updates: Partial<Vehicle>) =>
        apiFetch<{ success: boolean; vehicle: Vehicle }>(
            `/api/provider/vehicles/${id}`,
            {
                method: "PATCH",
                body: JSON.stringify(updates),
            }
        ),

    // Delete vehicle
    deleteVehicle: (id: string) =>
        apiFetch<{ success: boolean; message: string }>(
            `/api/provider/vehicles/${id}`,
            {
                method: "DELETE",
            }
        ),

    // Get provider's bookings/rentals
    getRentals: () =>
        apiFetch<Rental[]>("/api/provider/rentals"),

    // Update rental status (accept/reject/cancel)
    updateRentalStatus: (id: string, status: Rental["status"]) =>
        apiFetch<Rental>(
            `/api/provider/rentals/${id}`,
            {
                method: "PATCH",
                body: JSON.stringify({ status }),
            }
        ),
};

// ============================================
// ADMIN APIs
// ============================================

export const adminApi = {
    // Get all providers
    getProviders: (status?: Provider["providerStatus"]) => {
        const query = status ? `?status=${status}` : "";
        return apiFetch<Provider[]>(`/api/admin/providers${query}`);
    },

    // Approve provider
    approveProvider: (id: string) =>
        apiFetch<{ success: boolean; user: Provider }>(
            `/api/admin/providers/${id}`,
            {
                method: "PATCH",
                body: JSON.stringify({ providerStatus: "approved" }),
            }
        ),

    // Reject provider
    rejectProvider: (id: string) =>
        apiFetch<{ success: boolean; user: Provider }>(
            `/api/admin/providers/${id}`,
            {
                method: "PATCH",
                body: JSON.stringify({ providerStatus: "rejected" }),
            }
        ),

    // Get single provider
    getProvider: (id: string) =>
        apiFetch<Provider>(`/api/admin/providers/${id}`),

    // Update provider status
    updateProviderStatus: (id: string, providerStatus: Provider["providerStatus"]) =>
        apiFetch<{ success: boolean; user: Provider }>(
            `/api/admin/providers/${id}`,
            {
                method: "PATCH",
                body: JSON.stringify({ providerStatus }),
            }
        ),

    getUsers: () =>
        apiFetch<{ users: UserInfo[] }>("/api/admin/users"),

    // Get all rentals (admin)
    getAllRentals: () =>
        apiFetch<Rental[]>("/api/admin/rentals"),

    // Get single rental (admin)
    getRental: (id: string) =>
        apiFetch<{ rental: Rental }>(`/api/admin/rentals/${id}`),
};

// ============================================
// Export all APIs
// ============================================

const apiClient = {
    auth: authApi,
    vehicles: vehiclesApi,
    rentals: rentalsApi,
    provider: providerApi,
    admin: adminApi,
};

export default apiClient;
export { type Vehicle, type Rental, type UserInfo, type VehicleImage, type Provider };
