/**
 * Handles action prerequisite checks (guards).
 */

/**
 * Check if a rental can be created based on owner status
 */
export function canCreateRental(isOwner: boolean): { allowed: boolean; reason?: string } {
    if (isOwner) {
        return { allowed: false, reason: "You cannot rent your own vehicle" };
    }
    return { allowed: true };
}
