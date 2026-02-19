import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// MongoDB URI - hardcoded for this script as requested previously
const MONGODB_URI = "mongodb+srv://Rentola:KhV0hoWh5rwoErfX@rentola.pnydrk6.mongodb.net/rentola";

// Inline schemas to ensure the script is self-contained and avoids model compilation issues
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'provider', 'admin'], default: 'user' },
    providerStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    imageUrl: { type: String },
    documents: [{ type: { type: String }, url: { type: String } }]
}, { timestamps: true });

const VehicleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['car', 'bike'], required: true },
    licensePlate: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pricePerDay: { type: Number, required: true },
    vehicleImageUrl: [{ type: { type: String }, url: { type: String } }],
    isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

const RentalSchema = new mongoose.Schema({
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    renterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pickupLocation: { type: String, required: true },
    dropOffLocation: { type: String, required: true },
    rentalPeriod: {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true }
    },
    totalCost: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'active', 'completed', 'cancelled'], default: 'pending' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);
const Rental = mongoose.models.Rental || mongoose.model('Rental', RentalSchema);

const vehicleImages = {
    car: [
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1489824285312-0ad93f50f43b?auto=format&fit=crop&q=80&w=1000",
    ],
    bike: [
        "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1558981285-6f0c94958bb5?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1571422427250-4ab21de13bf5?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1449491073997-7593c149f6f6?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?auto=format&fit=crop&q=80&w=1000",
    ]
};

const locations = [
    "Downtown Central", "International Airport", "Railway Station", "Beachside Resort", "Business Park", "University Campus"
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Rental.deleteMany({});
        await Vehicle.deleteMany({});
        await User.deleteMany({});
        console.log('Cleared existing data');

        const hashedPassword = await bcrypt.hash('password123', 10);

        // 1. Create Admin
        const admin = await User.create({
            name: 'Super Admin',
            email: 'admin@rentola.com',
            password: hashedPassword,
            role: 'admin',
            providerStatus: 'approved'
        });
        console.log('Created Admin');

        // 2. Create 5 Providers
        const providers = [];
        for (let i = 1; i <= 5; i++) {
            const provider = await User.create({
                name: `Provider ${i}`,
                email: `provider${i}@rentola.com`,
                password: hashedPassword,
                role: 'provider',
                providerStatus: 'approved'
            });
            providers.push(provider);
        }
        console.log(`Created ${providers.length} Providers`);

        // 3. Create 10 Users
        const standardUsers = [];
        for (let i = 1; i <= 10; i++) {
            const user = await User.create({
                name: `User ${i}`,
                email: `user${i}@rentola.com`,
                password: hashedPassword,
                role: 'user'
            });
            standardUsers.push(user);
        }
        console.log(`Created ${standardUsers.length} Users`);

        // 4. Create 30 Vehicles (6 per provider)
        const vehicles = [];
        const carNames = ["Toyota Camry", "Honda Civic", "BMW X5", "Tesla Model 3", "Ford Mustang", "Audi A4", "Mercedes C-Class", "Hyundai Sonata", "Nissan Altima", "Chevrolet Malibu"];
        const bikeNames = ["Harley Davidson", "Ducati Monster", "Royal Enfield", "Yamaha R1", "Kawasaki Ninja", "Honda CBR", "Suzuki Hayabusa"];

        for (const provider of providers) {
            for (let j = 1; j <= 6; j++) {
                const isCar = Math.random() > 0.3;
                const name = isCar
                    ? `${carNames[Math.floor(Math.random() * carNames.length)]} ${2020 + Math.floor(Math.random() * 5)}`
                    : `${bikeNames[Math.floor(Math.random() * bikeNames.length)]} ${2020 + Math.floor(Math.random() * 5)}`;

                const vehicle = await Vehicle.create({
                    name,
                    type: isCar ? 'car' : 'bike',
                    licensePlate: `ABC-${1000 + Math.floor(Math.random() * 9000)}`,
                    ownerId: provider._id,
                    pricePerDay: isCar ? 1500 + Math.floor(Math.random() * 5000) : 500 + Math.floor(Math.random() * 2000),
                    isAvailable: true,
                    vehicleImageUrl: [{
                        type: 'main',
                        url: isCar
                            ? vehicleImages.car[Math.floor(Math.random() * vehicleImages.car.length)]
                            : vehicleImages.bike[Math.floor(Math.random() * vehicleImages.bike.length)]
                    }]
                });
                vehicles.push(vehicle);
            }
        }
        console.log(`Created ${vehicles.length} Vehicles`);

        // 5. Create 20 Rentals
        for (let i = 1; i <= 20; i++) {
            const randomUser = standardUsers[Math.floor(Math.random() * standardUsers.length)];
            const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
            const days = 1 + Math.floor(Math.random() * 7);

            const startDate = new Date();
            startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30)); // Sometime in last 30 days
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + days);

            await Rental.create({
                vehicleId: randomVehicle._id,
                renterId: randomUser._id,
                pickupLocation: locations[Math.floor(Math.random() * locations.length)],
                dropOffLocation: locations[Math.floor(Math.random() * locations.length)],
                rentalPeriod: {
                    startDate,
                    endDate
                },
                totalCost: randomVehicle.pricePerDay * days,
                status: ['pending', 'active', 'completed', 'cancelled'][Math.floor(Math.random() * 4)]
            });
        }
        console.log('Created 20 Rentals');

        console.log('\n=== SEED COMPLETE ===');
        console.log('Admin: admin@rentola.com (password123)');
        console.log('Providers: provider1-5@rentola.com (password123)');
        console.log('Users: user1-10@rentola.com (password123)');

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');

    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seed();
