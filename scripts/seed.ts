import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rentola';

// User Schema (inline for seed script)
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'provider', 'admin'], default: 'user' },
    providerStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    imageUrl: { type: String },
    documents: [{ type: { type: String }, url: { type: String } }]
}, { timestamps: true });

// Vehicle Schema (inline for seed script)
const VehicleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['car', 'bike'], required: true },
    licensePlate: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pricePerDay: { type: Number, required: true },
    vehicleImageUrl: [{ type: { type: String }, url: { type: String } }],
    isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models?.User || mongoose.model('User', UserSchema);
const Vehicle = mongoose.models?.Vehicle || mongoose.model('Vehicle', VehicleSchema);

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data (optional - comment out if you want to keep existing)
        await User.deleteMany({});
        await Vehicle.deleteMany({});
        console.log('Cleared existing users and vehicles');

        // Hash password
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Create Users
        const users = await User.insertMany([
            {
                name: 'Admin User',
                email: 'admin@rentola.com',
                password: hashedPassword,
                role: 'admin',
                providerStatus: 'approved'
            },
            {
                name: 'John Provider',
                email: 'john@provider.com',
                password: hashedPassword,
                role: 'provider',
                providerStatus: 'approved'
            },
            {
                name: 'Jane Provider',
                email: 'jane@provider.com',
                password: hashedPassword,
                role: 'provider',
                providerStatus: 'approved'
            },
            {
                name: 'Bob User',
                email: 'bob@user.com',
                password: hashedPassword,
                role: 'user',
                providerStatus: 'pending'
            },
            {
                name: 'Alice User',
                email: 'alice@user.com',
                password: hashedPassword,
                role: 'user',
                providerStatus: 'pending'
            }
        ]);

        console.log(`Created ${users.length} users`);

        // Create Vehicles (owned by providers)
        const johnProvider = users.find(u => u.email === 'john@provider.com');
        const janeProvider = users.find(u => u.email === 'jane@provider.com');

        const vehicles = await Vehicle.insertMany([
            {
                name: 'Toyota Camry 2023',
                type: 'car',
                licensePlate: 'ABC-1234',
                ownerId: johnProvider._id,
                pricePerDay: 50,
                isAvailable: true,
                vehicleImageUrl: [{ type: 'front', url: 'https://example.com/camry.jpg' }]
            },
            {
                name: 'Honda Civic 2022',
                type: 'car',
                licensePlate: 'XYZ-5678',
                ownerId: johnProvider._id,
                pricePerDay: 45,
                isAvailable: true,
                vehicleImageUrl: [{ type: 'front', url: 'https://example.com/civic.jpg' }]
            },
            {
                name: 'BMW X5 2023',
                type: 'car',
                licensePlate: 'BMW-9999',
                ownerId: janeProvider._id,
                pricePerDay: 120,
                isAvailable: true,
                vehicleImageUrl: [{ type: 'front', url: 'https://example.com/bmw.jpg' }]
            },
            {
                name: 'Yamaha R15',
                type: 'bike',
                licensePlate: 'BIKE-001',
                ownerId: janeProvider._id,
                pricePerDay: 25,
                isAvailable: true,
                vehicleImageUrl: [{ type: 'side', url: 'https://example.com/r15.jpg' }]
            },
            {
                name: 'Royal Enfield Classic',
                type: 'bike',
                licensePlate: 'BIKE-002',
                ownerId: johnProvider._id,
                pricePerDay: 30,
                isAvailable: false,  // This one is unavailable
                vehicleImageUrl: [{ type: 'side', url: 'https://example.com/enfield.jpg' }]
            }
        ]);

        console.log(`Created ${vehicles.length} vehicles`);

        console.log('\n=== SEED COMPLETE ===');
        console.log('\nTest Accounts (password: password123):');
        console.log('  Admin:    admin@rentola.com');
        console.log('  Provider: john@provider.com');
        console.log('  Provider: jane@provider.com');
        console.log('  User:     bob@user.com');
        console.log('  User:     alice@user.com');

        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');

    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seed();
