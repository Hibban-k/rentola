/**
 * Handles all state machine transitions for rentals and providers.
 */

export const RENTAL_STATUSES = ["pending", "active", "completed", "cancelled"] as const;
export type RentalStatus = (typeof RENTAL_STATUSES)[number];

export const PROVIDER_STATUSES = ["pending", "approved", "rejected"] as const;
export type ProviderStatus = (typeof PROVIDER_STATUSES)[number];

/**
 * Check if rental status can transition from current to next
 */
export function canChangeRentalStatus(
    current: RentalStatus | string,
    next: RentalStatus | string
): boolean {
    const allowed: Record<string, string[]> = {
        pending: ["active", "cancelled"],
        active: ["completed", "cancelled"],
        completed: [],
        cancelled: [],
    };

    return allowed[current]?.includes(next) ?? false;
}

/**
 * Check if provider status can transition from current to next
 */
export function canChangeProviderStatus(
    current: string,
    next: string
): boolean {
    const allowed: Record<string, string[]> = {
        pending: ["approved", "rejected"],
        approved: [],
        rejected: [],
    };

    return allowed[current]?.includes(next) ?? false;
}
