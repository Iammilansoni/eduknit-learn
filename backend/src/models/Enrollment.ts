import { Schema, model, Document } from 'mongoose';

/**
 * Interface representing a Student Enrollment document in MongoDB.
 */
export interface IEnrollment extends Document {
    studentId: Schema.Types.ObjectId;
    programmeId: Schema.Types.ObjectId;
    enrollmentDate: Date;
    status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';
    progress: {
        completedModules: Schema.Types.ObjectId[];
        completedLessons: Schema.Types.ObjectId[];
        totalProgress: number; // percentage 0-100
        lastActivityDate: Date;
        timeSpent: number; // in minutes
    };
    paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    paymentReference?: string;
    certificateIssued: boolean;
    certificateIssuedDate?: Date;
    certificateId?: string;
    completionDate?: Date;
    expiryDate?: Date; // For time-limited courses
    notes?: string; // Admin notes
    metadata: {
        enrollmentSource: 'DIRECT' | 'PROMOTION' | 'ADMIN' | 'REFERRAL';
        referralCode?: string;
        discountApplied?: number;
        originalPrice?: number;
        finalPrice?: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        programmeId: {
            type: Schema.Types.ObjectId,
            ref: 'Programme',
            required: true,
            index: true
        },
        enrollmentDate: {
            type: Date,
            default: Date.now,
            index: true
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED', 'EXPIRED'],
            default: 'ACTIVE',
            index: true
        },
        progress: {
            completedModules: [{
                type: Schema.Types.ObjectId,
                ref: 'ProgrammeModule'
            }],
            completedLessons: [{
                type: Schema.Types.ObjectId,
                ref: 'ProgrammeLesson'
            }],
            totalProgress: {
                type: Number,
                min: 0,
                max: 100,
                default: 0,
                index: true
            },
            lastActivityDate: {
                type: Date,
                default: Date.now
            },
            timeSpent: {
                type: Number,
                default: 0,
                min: 0 // in minutes
            }
        },
        paymentStatus: {
            type: String,
            enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
            default: 'PENDING',
            index: true
        },
        paymentReference: {
            type: String,
            trim: true,
            index: { sparse: true }
        },
        certificateIssued: {
            type: Boolean,
            default: false,
            index: true
        },
        certificateIssuedDate: {
            type: Date,
            index: { sparse: true }
        },
        certificateId: {
            type: String,
            trim: true,
            unique: true,
            sparse: true,
            index: true
        },
        completionDate: {
            type: Date,
            index: { sparse: true }
        },
        expiryDate: {
            type: Date,
            index: { sparse: true }
        },
        notes: {
            type: String,
            trim: true,
            maxlength: 1000
        },
        metadata: {
            enrollmentSource: {
                type: String,
                enum: ['DIRECT', 'PROMOTION', 'ADMIN', 'REFERRAL'],
                default: 'DIRECT'
            },
            referralCode: {
                type: String,
                trim: true,
                uppercase: true
            },
            discountApplied: {
                type: Number,
                min: 0,
                max: 100
            },
            originalPrice: {
                type: Number,
                min: 0
            },
            finalPrice: {
                type: Number,
                min: 0
            }
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform: function(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                return ret;
            }
        }
    }
);

// Compound indexes for better query performance
EnrollmentSchema.index({ studentId: 1, status: 1 });
EnrollmentSchema.index({ programmeId: 1, status: 1 });
EnrollmentSchema.index({ studentId: 1, programmeId: 1 }, { unique: true });
EnrollmentSchema.index({ enrollmentDate: -1 });
EnrollmentSchema.index({ 'progress.totalProgress': -1 });
EnrollmentSchema.index({ certificateIssued: 1, completionDate: -1 });

// Virtual for checking if enrollment is active
EnrollmentSchema.virtual('isActive').get(function() {
    if (this.status !== 'ACTIVE') return false;
    if (this.expiryDate && this.expiryDate < new Date()) return false;
    return true;
});

// Virtual for calculating completion percentage
EnrollmentSchema.virtual('completionPercentage').get(function() {
    return Math.round(this.progress.totalProgress);
});

// Virtual for time remaining (if expiry date is set)
EnrollmentSchema.virtual('timeRemaining').get(function() {
    if (!this.expiryDate) return null;
    const now = new Date();
    const remaining = this.expiryDate.getTime() - now.getTime();
    return remaining > 0 ? Math.ceil(remaining / (1000 * 60 * 60 * 24)) : 0; // days
});

// Method to update progress
EnrollmentSchema.methods.updateProgress = async function(
    moduleId?: string,
    lessonId?: string,
    timeSpent: number = 0
) {
    if (moduleId && !this.progress.completedModules.includes(moduleId)) {
        this.progress.completedModules.push(moduleId);
    }
    
    if (lessonId && !this.progress.completedLessons.includes(lessonId)) {
        this.progress.completedLessons.push(lessonId);
    }
    
    this.progress.timeSpent += timeSpent;
    this.progress.lastActivityDate = new Date();
    
    // Calculate total progress - this would need programme data
    // For now, we'll update it separately
    
    return this.save();
};

// Method to mark as completed
EnrollmentSchema.methods.markAsCompleted = function() {
    this.status = 'COMPLETED';
    this.progress.totalProgress = 100;
    this.completionDate = new Date();
    return this.save();
};

// Method to issue certificate
EnrollmentSchema.methods.issueCertificate = function() {
    if (this.status !== 'COMPLETED') {
        throw new Error('Cannot issue certificate for incomplete course');
    }
    
    this.certificateIssued = true;
    this.certificateIssuedDate = new Date();
    this.certificateId = this.generateCertificateId();
    
    return this.save();
};

// Method to generate unique certificate ID
EnrollmentSchema.methods.generateCertificateId = function() {
    const prefix = 'EDUKNIT';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
};

// Static method to find active enrollments for student
EnrollmentSchema.statics.findActiveForStudent = function(studentId: string) {
    return this.find({
        studentId,
        status: 'ACTIVE',
        $or: [
            { expiryDate: { $exists: false } },
            { expiryDate: { $gt: new Date() } }
        ]
    }).populate('programmeId');
};

// Static method to get enrollment statistics
EnrollmentSchema.statics.getStudentStats = function(studentId: string) {
    return this.aggregate([
        { $match: { studentId: new Schema.Types.ObjectId(studentId) } },
        {
            $group: {
                _id: null,
                totalEnrollments: { $sum: 1 },
                activeEnrollments: {
                    $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] }
                },
                completedCourses: {
                    $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
                },
                averageProgress: { $avg: '$progress.totalProgress' },
                totalTimeSpent: { $sum: '$progress.timeSpent' },
                certificatesEarned: {
                    $sum: { $cond: ['$certificateIssued', 1, 0] }
                }
            }
        }
    ]);
};

export default model<IEnrollment>('Enrollment', EnrollmentSchema);
