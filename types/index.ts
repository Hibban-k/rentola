export type VehicleType = "car" | "bike";
export type ProviderStatus = "pending" | "approved" | "rejected";
export type RentalStatus = "pending" | "active" | "completed" | "cancelled";
export type UserRole = "user" | "provider" | "admin";

export interface VehicleImage {
    type: string;
    url: string;
}

export interface Vehicle {
    _id: string;
    name: string;
    type: VehicleType;
    pricePerDay: number;
    licensePlate: string;
    vehicleImageUrl: VehicleImage[];
    pickupStation: string;
    isAvailable: boolean;
    ownerId: string;
    owner?: {
        name: string;
        email?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface VehicleFilters {
    type?: VehicleType;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
}

export interface CreateVehiclePayload {
    name: string;
    type: VehicleType;
    licensePlate: string;
    pricePerDay: number;
    vehicleImageUrl: { type: string; url: string }[];
    pickupStation: string;
}

export interface UserInfo {
    _id: string;
    userId?: string; // used in some components
    name?: string;
    email?: string;
    role: UserRole;
    providerStatus?: ProviderStatus;
    createdAt?: string;
    updatedAt?: string;
}

export interface Rental {
    _id: string;
    vehicleId: Vehicle;
    renterId: string | UserInfo;
    rentalPeriod: {
        startDate: string;
        endDate: string;
    };
    totalCost: number;
    status: RentalStatus;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateRentalPayload {
    vehicleId: string;
    startDate: string;
    endDate: string;
}

export interface SignupPayload {
    name: string;
    email: string;
    password: string;
    role: "user" | "provider";
    imageurl?: string;
    licenseImageUrl?: string;
    documents?: {
        type: string;
        url: string;
    }[];
}

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
        providerStatus?: ProviderStatus;
    };
}

export interface Provider {
    _id: string;
    name: string;
    email: string;
    providerStatus: ProviderStatus;
    createdAt: string;
    documents?: { type: string; url: string }[];
}

export interface APIResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

export type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};
