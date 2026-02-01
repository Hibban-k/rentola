# API Client Usage

Centralized API client at `lib/apiClient.ts` for all frontend API calls.

## Quick Reference

| File | API Used |
|------|----------|
| `auth/signin/page.tsx` | `authApi.signin()` |
| `auth/signup/page.tsx` | `authApi.signup()` |
| `dashboard/page.tsx` | `rentalsApi.list()` |
| `vehicles/page.tsx` | `vehiclesApi.list()` |
| `vehicles/[id]/page.tsx` | `vehiclesApi.get()` |
| `vehicles/[id]/book/page.tsx` | `vehiclesApi.get()`, `rentalsApi.create()` |
| `provider/dashboard/page.tsx` | `providerApi.getVehicles()`, `providerApi.updateVehicle()` |
| `provider/vehicles/new/page.tsx` | `providerApi.createVehicle()` |
| `admin/dashboard/page.tsx` | `adminApi.getProviders()`, `adminApi.updateProviderStatus()` |

## Available APIs

### authApi
- `signin(payload)` - Login user
- `signup(payload)` - Register user
- `getCurrentUser()` - Get user from token
- `logout()` - Clear token
- `isLoggedIn()` - Check if logged in

### vehiclesApi
- `list(filters?)` - Get vehicles (public)
- `get(id)` - Get vehicle details

### rentalsApi (authenticated)
- `list()` - User's rentals
- `create(payload)` - Book vehicle

### providerApi (authenticated)
- `getVehicles()` - Provider's vehicles
- `getVehicle(id)` - Single vehicle
- `createVehicle(payload)` - Add vehicle
- `updateVehicle(id, updates)` - Update vehicle

### adminApi (authenticated)
- `getProviders(status?)` - List providers
- `updateProviderStatus(id, status)` - Approve/reject

## Usage Example

```tsx
import { vehiclesApi, authApi } from "@/lib/apiClient";

// Fetch data
const { data, error } = await vehiclesApi.list({ type: "car" });
if (error) throw new Error(error);
setVehicles(data?.vehicles || []);

// Check auth
if (!authApi.isLoggedIn()) {
    router.push("/auth/signin");
}
```
