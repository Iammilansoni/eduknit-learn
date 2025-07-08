import { Schema, model, Document } from 'mongoose';

/**
 * Interface representing a User document in MongoDB.
 */
export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'user' | 'student' | 'visitor';
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
    dateOfBirth?: Date;
    phoneNumber?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
    };
    enrollmentStatus: 'active' | 'inactive' | 'suspended';
    enrollmentDate?: Date;
    lastLoginAt?: Date;
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
    verificationMessageSeen: boolean;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    loginAttempts: number;
    lockUntil?: Date;
    refreshTokens: string[];
    // Privacy and visibility settings
    profileVisibility: 'public' | 'private' | 'contacts_only';
    dataRetentionConsent: boolean;
    marketingConsent: boolean;
    // Account deletion tracking
    deletionRequested: boolean;
    deletionRequestedAt?: Date;
    deletionScheduledFor?: Date;
    deletionReason?: string;
    isDeleted: boolean;
    deletedAt?: Date;
    deletedBy?: string; // admin user ID who approved deletion
    createdAt: Date;
    updatedAt: Date;
    isLocked(): boolean;
    incLoginAttempts(): Promise<any>;
    resetLoginAttempts(): Promise<any>;
}

const UserSchema = new Schema<IUser>(
    {
        username: { 
            type: String, 
            required: true, 
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 30
        },
        email: { 
            type: String, 
            required: true, 
            unique: true,
            lowercase: true,
            trim: true
        },
        password: { 
            type: String, 
            required: true,
            minlength: 8
        },
        role: {
            type: String,
            enum: ['admin', 'user', 'student', 'visitor'],
            default: 'visitor',
        },
        firstName: {
            type: String,
            trim: true,
            maxlength: 50
        },
        lastName: {
            type: String,
            trim: true,
            maxlength: 50
        },
        profilePicture: {
            type: String,
            default: null
        },
        dateOfBirth: {
            type: Date
        },
        phoneNumber: {
            type: String,
            trim: true
        },
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String
        },
        enrollmentStatus: {
            type: String,
            enum: ['active', 'inactive', 'suspended'],
            default: 'active'
        },
        enrollmentDate: {
            type: Date,
            default: Date.now
        },
        lastLoginAt: {
            type: Date
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        emailVerificationToken: String,
        emailVerificationExpires: Date,
        verificationMessageSeen: {
            type: Boolean,
            default: false
        },
        passwordResetToken: String,
        passwordResetExpires: Date,
        loginAttempts: {
            type: Number,
            default: 0
        },
        lockUntil: Date,
        refreshTokens: [{
            type: String
        }],
        // Privacy and visibility settings
        profileVisibility: {
            type: String,
            enum: ['public', 'private', 'contacts_only'],
            default: 'public'
        },
        dataRetentionConsent: {
            type: Boolean,
            default: true
        },
        marketingConsent: {
            type: Boolean,
            default: false
        },
        // Account deletion tracking
        deletionRequested: {
            type: Boolean,
            default: false
        },
        deletionRequestedAt: {
            type: Date
        },
        deletionScheduledFor: {
            type: Date
        },
        deletionReason: {
            type: String,
            maxlength: 500
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        deletedAt: {
            type: Date
        },
        deletedBy: {
            type: String // Admin user ID who approved deletion
        }
    },
    { 
        timestamps: true,
        toJSON: {
            transform: function(doc, ret) {
                ret.id = ret._id;
                delete (ret as any)._id;
                delete (ret as any).__v;
                delete (ret as any).password;
                delete (ret as any).emailVerificationToken;
                delete (ret as any).emailVerificationExpires;
                delete (ret as any).passwordResetToken;
                delete (ret as any).passwordResetExpires;
                delete (ret as any).refreshTokens;
                return ret;
            }
        }
    }
);

// Index for better query performance
UserSchema.index({ username: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ enrollmentStatus: 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function(this: IUser) {
    if (this.firstName && this.lastName) {
        return `${this.firstName} ${this.lastName}`;
    }
    return this.username;
});

// Method to check if user is active
UserSchema.methods.isActive = function() {
    return this.enrollmentStatus === 'active';
};

// Method to update last login
UserSchema.methods.updateLastLogin = function() {
    this.lastLoginAt = new Date();
    return this.save();
};

// Method to check if account is locked
UserSchema.methods.isLocked = function() {
    return !!(this.lockUntil && this.lockUntil > new Date());
};

// Method to increment login attempts
UserSchema.methods.incLoginAttempts = function() {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < new Date()) {
        return this.updateOne({
            $unset: { lockUntil: 1 },
            $set: { loginAttempts: 1 }
        });
    }
    
    const updates: any = { $inc: { loginAttempts: 1 } };
    
    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
        updates.$set = { lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) };
    }
    
    return this.updateOne(updates);
};

// Method to reset login attempts
UserSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 }
    });
};

export default model<IUser>('User', UserSchema);
