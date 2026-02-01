import mongoose, { Schema, Document, Model, models, model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: 'user' | 'provider' | 'admin';
    imageUrl?: string;
    providerStatus: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
    documents?: {
        type: String;
        url: string;

    }[];
    comparePassword(candidatePassword: string): Promise<boolean>;
}
const UserSchema: Schema<IUser> = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ['user', 'provider', 'admin'], default: 'user' },
        providerStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'

        },
        imageUrl: { type: String },
        documents: [
            {
                type: { type: String, required: true },
                url: { type: String, required: true }
            }
        ]
    },
    { timestamps: true }
);
// this is hook its never save the dat its change the data before save to database
UserSchema.pre('save', async function () {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);


    }
})

// Method to compare password for sign-in
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUser> = models?.User || model<IUser>('User', UserSchema);
export default User;