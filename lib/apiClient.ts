/**
 * API Client - Centralized helper functions for backend API calls
 */

const API_BASE = "";

// Helper to get auth token
const getToken = (): string | null => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("token");
    }
    return null;
};

// Helper to build headers
const getHeaders = (authenticated = false): HeadersInit => {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (authenticated) {
        const token = getToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    }

    return headers;
};

// Generic API response type
interface ApiResponse<T> {
    data?: T;
    error?: string;
}

// Generic fetch wrapper
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {},
    authenticated = false
): Promise<ApiResponse<T>> {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                ...getHeaders(authenticated),
                ...options.headers,
            },
        });

        const data = await res.json();

        if (!res.ok) {
            return { error: data.error || "Request failed" };
        }

        return { data };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Network error" };
    }
}

// ============================================
// AUTH APIs
// ============================================

export interface SignupPayload {
    name: string;
    email: string;
    password: string;
   role: "user" | "provider"; 
   imageurl?:string;
   documents?:{
    type:string;
    url:string;
   }[];
}

export interface SigninPayload {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: "user" | "provider" | "admin";
        providerStatus?: "pending" | "approved" | "rejected";
    };
}

export const authApi = {
    signup: (payload: SignupPayload) =>
        apiFetch<AuthResponse>("/api/auth/signup", {
            method: "POST",
            body: JSON.stringify(payload),
        }),

    signin: (payload: SigninPayload) =>
        apiFetch<AuthResponse>("/api/auth/signin", {
            method: "POST",
            body: JSON.stringify(payload),
        }),

    // Get current user from token
    getCurrentUser: () => {
        const token = getToken();
        if (!token){
            throw new Error("UNAUTHENTICATED");
        };

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return {
                userId: payload.userId,
                role: payload.role as "user" | "provider" | "admin",
                providerStatus: payload.providerStatus as "pending" | "approved" | "rejected",
            };
        } catch {
            throw new Error("INVALID_TOKEN");
        }
    },

    logout: () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
        }
    },

    isLoggedIn: () => !!getToken(),
};

// ============================================
// VEHICLES APIs (Public)
// ============================================

export interface Vehicle {
    _id: string;
    name: string;
    type: "car" | "bike";
    pricePerDay: number;
    licensePlate: string;
    vehicleImageUrl: { type: string; url: string }[];
    isAvailable: boolean;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
}

export interface VehicleFilters {
    type?: "car" | "bike";
    search?: string;
    minPrice?: number;
    maxPrice?: number;
}

export const vehiclesApi = {
    // List all available vehicles
    list: (filters?: VehicleFilters) => {
        const params = new URLSearchParams();
        if (filters?.type) params.set("type", filters.type);
        if (filters?.search) params.set("search", filters.search);
        if (filters?.minPrice) params.set("minPrice", String(filters.minPrice));
        if (filters?.maxPrice) params.set("maxPrice", String(filters.maxPrice));

        const query = params.toString();
        return apiFetch<{ vehicles: Vehicle[] }>(`/api/vehicles${query ? `?${query}` : ""}`);
    },

    // Get single vehicle
    get: (id: string) =>
        apiFetch<{ vehicle: Vehicle & { owner?: { name: string } } }>(`/api/vehicles/${id}`),
};

// ============================================
// RENTALS APIs (User)
// ============================================

export interface Rental {
    _id: string;
    vehicleId: Vehicle;
    renterId: string;
    pickupLocation: string;
    dropOffLocation: string;
    rentalPeriod: {
        startDate: string;
        endDate: string;
    };
    totalCost: number;
    status: "pending" | "active" | "completed" | "cancelled";
    createdAt: string;
}

export interface CreateRentalPayload {
    vehicleId: string;
    startDate: string;
    endDate: string;
    pickupLocation: string;
    dropOffLocation: string;
}

export const rentalsApi = {
    // Get user's rentals
    list: () =>
        apiFetch<{ rentals: Rental[] }>("/api/users/rentals", {}, true),

    // Create a new rental
    create: (payload: CreateRentalPayload) =>
        apiFetch<{ success: boolean; message: string }>(
            "/api/users/rentals",
            {
                method: "POST",
                body: JSON.stringify(payload),
            },
            true
        ),
};

// ============================================
// PROVIDER APIs
// ============================================

export interface CreateVehiclePayload {
    name: string;
    type: "car" | "bike";
    licensePlate: string;
    pricePerDay: number;
    vehicleImageUrl: { type: string; url: string }[];
}

export const providerApi = {
    // Get provider's vehicles
    getVehicles: () =>
        apiFetch<{ vehicles: Vehicle[] }>("/api/provider/vehicles", {}, true),

    // Get single vehicle
    getVehicle: (id: string) =>
        apiFetch<{ vehicle: Vehicle }>(`/api/provider/vehicles/${id}`, {}, true),

    // Create a vehicle
    createVehicle: (payload: CreateVehiclePayload) =>
        apiFetch<{ success: boolean; message: string }>(
            "/api/provider/createVehicle",
            {
                method: "POST",
                body: JSON.stringify(payload),
            },
            true
        ),

    // Update vehicle (availability, etc.)
    updateVehicle: (id: string, updates: Partial<Vehicle>) =>
        apiFetch<{ success: boolean; vehicle: Vehicle }>(
            `/api/provider/vehicles/${id}`,
            {
                method: "PATCH",
                body: JSON.stringify(updates),
            },
            true
        ),
};

// ============================================
// ADMIN APIs
// ============================================

export interface Provider {
    _id: string;
    name: string;
    email: string;
    providerStatus: "pending" | "approved" | "rejected";
    createdAt: string;
    documents?: { type: string; url: string }[];
}

export const adminApi = {
    // Get all providers
    getProviders: (status?: "pending" | "approved" | "rejected") => {
        const query = status ? `?status=${status}` : "";
        return apiFetch<{ providers: Provider[] }>(`/api/admin/providers${query}`, {}, true);
    },

    // Update provider status
    updateProviderStatus: (id: string, providerStatus: "approved" | "rejected") =>
        apiFetch<{ success: boolean; user: Provider }>(
            `/api/admin/providers/${id}`,
            {
                method: "PATCH",
                body: JSON.stringify({ providerStatus }),
            },
            true
        ),
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
