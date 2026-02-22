import User, { IUser } from "@/models/User";

export class UserRepository {
    async findById(id: string): Promise<IUser | null> {
        return User.findById(id);
    }

    async findByEmail(email: string): Promise<IUser | null> {
        return User.findOne({ email });
    }

    async findAll(): Promise<IUser[]> {
        return User.find().sort({ createdAt: -1 });
    }

    async findByRole(role: string): Promise<IUser[]> {
        return User.find({ role }).sort({ createdAt: -1 });
    }

    async create(userData: Partial<IUser>): Promise<IUser> {
        return User.create(userData);
    }

    async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
        return User.findByIdAndUpdate(id, updateData, { new: true });
    }
}

export const userRepository = new UserRepository();
