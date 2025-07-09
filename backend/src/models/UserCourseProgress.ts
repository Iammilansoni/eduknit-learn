import { Schema, model, Document, Model } from 'mongoose';

/**
 * Interface representing a User Course Progress document in MongoDB.
 * This tracks individual lesson progress for each student
 */
export interface IUserCourseProgress extends Document {
    studentId: Schema.Types.ObjectId;
    programmeId: Schema.Types.ObjectId;
    moduleId: Schema.Types.ObjectId;
    lessonId: Schema.Types.ObjectId;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
    progressPercentage: number; // 0-100
    timeSpent: number; // in minutes
    startedAt?: Date;
    completedAt?: Date;
    lastAccessedAt: Date;
    completed?: Date; // Alias for completedAt
    lastAccessed?: Date; // Alias for lastAccessedAt
    attempts: number;
    bookmarked: boolean;
    notes?: string;
    watchTimeVideo?: number; // For video lessons, in seconds
    isRequired: boolean;
    createdAt: Date;
    updatedAt: Date;
    
    // Instance methods
    markAsStarted(): Promise<this>;
    markAsCompleted(timeSpent?: number): Promise<this>;
    updateProgress(progressPercentage: number, timeSpent?: number, watchTimeVideo?: number): Promise<this>;
}

/**
 * Interface for UserCourseProgress model with static methods
 */
export interface IUserCourseProgressModel extends Model<IUserCourseProgress> {
    getProgressSummary(studentId: string, programmeId: string): Promise<any[]>;
    calculateCourseProgress(studentId: string, programmeId: string): Promise<any[]>;
}

const UserCourseProgressSchema = new Schema<IUserCourseProgress>(
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
        moduleId: {
            type: Schema.Types.ObjectId,
            ref: 'ProgrammeModule',
            required: true,
            index: true
        },
        lessonId: {
            type: Schema.Types.ObjectId,
            ref: 'ProgrammeLesson',
            required: true,
            index: true
        },
        status: {
            type: String,
            enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'],
            default: 'NOT_STARTED',
            required: true,
            index: true
        },
        progressPercentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
            required: true
        },
        timeSpent: {
            type: Number,
            min: 0,
            default: 0,
            required: true // in minutes
        },
        startedAt: {
            type: Date,
            index: true
        },
        completedAt: {
            type: Date,
            index: true
        },
        lastAccessedAt: {
            type: Date,
            default: Date.now,
            required: true,
            index: true
        },
        attempts: {
            type: Number,
            min: 0,
            default: 0,
            required: true
        },
        bookmarked: {
            type: Boolean,
            default: false,
            index: true
        },
        notes: {
            type: String,
            trim: true,
            maxlength: 2000
        },
        watchTimeVideo: {
            type: Number,
            min: 0,
            default: 0 // in seconds
        },
        isRequired: {
            type: Boolean,
            default: true,
            required: true
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform: function(doc, ret) {
                ret.id = ret._id;
                delete (ret as any)._id;
                delete (ret as any).__v;
                return ret;
            }
        }
    }
);

// Unique compound index to prevent duplicate progress records
UserCourseProgressSchema.index(
    { studentId: 1, programmeId: 1, moduleId: 1, lessonId: 1 }, 
    { unique: true }
);

// Compound indexes for better query performance
UserCourseProgressSchema.index({ studentId: 1, programmeId: 1, status: 1 });
UserCourseProgressSchema.index({ studentId: 1, status: 1, lastAccessedAt: -1 });
UserCourseProgressSchema.index({ programmeId: 1, status: 1 });
UserCourseProgressSchema.index({ bookmarked: 1, studentId: 1 });

// Virtual for duration in friendly format
UserCourseProgressSchema.virtual('timeSpentFormatted').get(function() {
    const hours = Math.floor(this.timeSpent / 60);
    const minutes = this.timeSpent % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
});

// Virtual for completion status
UserCourseProgressSchema.virtual('isCompleted').get(function() {
    return this.status === 'COMPLETED';
});

// Method to mark as started
UserCourseProgressSchema.methods.markAsStarted = function() {
    if (this.status === 'NOT_STARTED') {
        this.status = 'IN_PROGRESS';
        this.startedAt = new Date();
        this.attempts += 1;
    }
    this.lastAccessedAt = new Date();
    return this.save();
};

// Method to mark as completed
UserCourseProgressSchema.methods.markAsCompleted = function(timeSpent: number = 0) {
    this.status = 'COMPLETED';
    this.progressPercentage = 100;
    this.completedAt = new Date();
    this.lastAccessedAt = new Date();
    this.timeSpent += timeSpent;
    return this.save();
};

// Method to update progress
UserCourseProgressSchema.methods.updateProgress = function(
    progressPercentage: number, 
    timeSpent: number = 0,
    watchTimeVideo: number = 0
) {
    this.progressPercentage = Math.min(100, Math.max(0, progressPercentage));
    this.timeSpent += timeSpent;
    this.lastAccessedAt = new Date();
    
    if (watchTimeVideo > 0) {
        this.watchTimeVideo = (this.watchTimeVideo || 0) + watchTimeVideo;
    }
    
    // Auto-mark as started if not already
    if (this.status === 'NOT_STARTED' && progressPercentage > 0) {
        this.status = 'IN_PROGRESS';
        this.startedAt = new Date();
        this.attempts += 1;
    }
    
    // Auto-mark as completed if 100%
    if (this.progressPercentage >= 100 && this.status !== 'COMPLETED') {
        this.status = 'COMPLETED';
        this.completedAt = new Date();
    }
    
    return this.save();
};

// Static method to get progress summary for a student's course
UserCourseProgressSchema.statics.getProgressSummary = function(studentId: string, programmeId: string) {
    return this.aggregate([
        { 
            $match: { 
                studentId: new Schema.Types.ObjectId(studentId),
                programmeId: new Schema.Types.ObjectId(programmeId)
            }
        },
        {
            $group: {
                _id: '$moduleId',
                totalLessons: { $sum: 1 },
                completedLessons: {
                    $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
                },
                inProgressLessons: {
                    $sum: { $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0] }
                },
                totalTimeSpent: { $sum: '$timeSpent' },
                averageProgress: { $avg: '$progressPercentage' }
            }
        },
        {
            $lookup: {
                from: 'programmemodules',
                localField: '_id',
                foreignField: '_id',
                as: 'module'
            }
        },
        {
            $unwind: '$module'
        },
        {
            $sort: { 'module.orderIndex': 1 }
        }
    ]);
};

// Static method to calculate overall course progress
UserCourseProgressSchema.statics.calculateCourseProgress = function(studentId: string, programmeId: string) {
    return this.aggregate([
        { 
            $match: { 
                studentId: new Schema.Types.ObjectId(studentId),
                programmeId: new Schema.Types.ObjectId(programmeId),
                isRequired: true
            }
        },
        {
            $group: {
                _id: null,
                totalRequiredLessons: { $sum: 1 },
                completedRequiredLessons: {
                    $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
                },
                totalTimeSpent: { $sum: '$timeSpent' },
                averageProgress: { $avg: '$progressPercentage' }
            }
        },
        {
            $project: {
                _id: 0,
                totalRequiredLessons: 1,
                completedRequiredLessons: 1,
                overallProgress: {
                    $multiply: [
                        { $divide: ['$completedRequiredLessons', '$totalRequiredLessons'] },
                        100
                    ]
                },
                totalTimeSpent: 1,
                averageProgress: 1
            }
        }
    ]);
};

export default model<IUserCourseProgress, IUserCourseProgressModel>('UserCourseProgress', UserCourseProgressSchema);
