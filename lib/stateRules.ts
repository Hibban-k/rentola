// lib/stateRules.ts → can this state change?

/**
 * Check if a rental can be created (business rules)
 */
export function canCreateRental(isOwner: boolean): { allowed: boolean; reason?: string } {
    if (isOwner) {
        return { allowed: false, reason: "You cannot rent your own vehicle" };
    }
    return { allowed: true };
}

/**
 * Check if rental status can transition
 */
export function canChangeRentalStatus(
    current: string,
    next: string
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
 * Check if provider status can transition
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

export function canCancelRental(
  role: "user" | "provider" | "admin",
  status: "pending" | "active" | "completed" | "cancelled"
): boolean {
  if (role === "admin") return true;

  if (role === "provider" && (status === "pending" || status === "active")) {
    return true;
  }

  if (role === "user" && status === "pending") {
    return true;
  }

  return false;
}

