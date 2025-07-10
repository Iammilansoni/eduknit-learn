import { Schema, model, Document, Model } from 'mongoose';
import { Types } from 'mongoose';

/**
 * Interface representing a User Course Enrollment document in MongoDB.
 * This extends the existing Enrollment model for course-specific data.
 */
export interface IUserCourse extends Document {
    userId: Schema.Types.ObjectId;
    courseId: Schema.Types.ObjectId;
    enrolledAt: Date;
    progressPercent: number;
    completedLessons: Schema.Types.ObjectId[];
    studyTime: number; // in minutes
    deadlines: {
        assignmentId: Schema.Types.ObjectId;
        dueDate: Date;
        completed: boolean;
        submittedAt?: Date;
    }[];
    lastAccessed: Date;
    status: 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'DROPPED';
    achievements: {
        badgeId: string;
        earnedAt: Date;
        points: number;
    }[];
    analytics: {
        streakDays: number;
        lastStreakDate: Date;
        totalPoints: number;
        averageScore: number;
        timeToComplete?: number; // in days
    };
    // Instance methods
    updateProgress(lessonId?: string, timeSpent?: number): Promise<this>;
    addAchievement(badgeId: string, points: number): boolean;
    updateStreak(): this;
}

// Interface for the model's static methods
export interface IUserCourseModel extends Model<IUserCourse> {
    findEnrolledForUser(userId: string): Promise<IUserCourse[]>;
    getUserStats(userId: string): Promise<any[]>;
}

const UserCourseSchema = new Schema<IUserCourse>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Programme',
            required: true,
            index: true
        },
        enrolledAt: {
            type: Date,
            default: Date.now,
            index: true
        },
        progressPercent: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
            index: true
        },
        completedLessons: [{
            type: Schema.Types.ObjectId,
            ref: 'ProgrammeLesson'
        }],
        studyTime: {
            type: Number,
            default: 0,
            min: 0 // in minutes
        },
        deadlines: [{
            assignmentId: {
                type: Schema.Types.ObjectId,
                ref: 'Assignment',
                required: true
            },
            dueDate: {
                type: Date,
                required: true
            },
            completed: {
                type: Boolean,
                default: false
            },
            submittedAt: {
                type: Date
            }
        }],
        lastAccessed: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['ENROLLED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED', 'DROPPED'],
            default: 'ENROLLED',
            index: true
        },
        achievements: [{
            badgeId: {
                type: String,
                required: true
            },
            earnedAt: {
                type: Date,
                default: Date.now
            },
            points: {
                type: Number,
                required: true,
                min: 0
            }
        }],
        analytics: {
            streakDays: {
                type: Number,
                default: 0,
                min: 0
            },
            lastStreakDate: {
                type: Date,
                default: Date.now
            },
            totalPoints: {
                type: Number,
                default: 0,
                min: 0
            },
            averageScore: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            },
            timeToComplete: {
                type: Number,
                min: 0 // in days
            }
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

// Compound indexes for better query performance
UserCourseSchema.index({ userId: 1, courseId: 1 }, { unique: true });
UserCourseSchema.index({ userId: 1, status: 1 });
UserCourseSchema.index({ courseId: 1, status: 1 });
UserCourseSchema.index({ enrolledAt: -1 });
UserCourseSchema.index({ progressPercent: -1 });
UserCourseSchema.index({ 'analytics.totalPoints': -1 });

// Virtual for checking if course is completed
UserCourseSchema.virtual('isCompleted').get(function() {
    return this.status === 'COMPLETED' || this.progressPercent === 100;
});

// Virtual for current progress label
UserCourseSchema.virtual('progressLabel').get(function() {
    if (this.progressPercent >= 100) return 'Completed';
    if (this.progressPercent >= 75) return 'Almost Done';
    if (this.progressPercent >= 50) return 'Halfway';
    if (this.progressPercent >= 25) return 'Getting Started';
    return 'Just Started';
});

// Method to update progress
UserCourseSchema.methods.updateProgress = function(lessonId?: string, timeSpent: number = 0) {
    if (lessonId && !this.completedLessons.includes(lessonId)) {
        this.completedLessons.push(lessonId);
    }
    
    this.studyTime += timeSpent;
    this.lastAccessed = new Date();
    
    // Update status based on progress
    if (this.progressPercent > 0 && this.progressPercent < 100) {
        this.status = 'IN_PROGRESS';
    } else if (this.progressPercent >= 100) {
        this.status = 'COMPLETED';
    }
    
    return this.save();
};

// Method to add achievement
UserCourseSchema.methods.addAchievement = function(badgeId: string, points: number) {
    const existing = this.achievements.find((a: any) => a.badgeId === badgeId);
    if (!existing) {
        this.achievements.push({
            badgeId,
            earnedAt: new Date(),
            points
        });
        this.analytics.totalPoints += points;
        return true;
    }
    return false;
};

// Method to update streak
UserCourseSchema.methods.updateStreak = function() {
    const today = new Date();
    const lastDate = this.analytics.lastStreakDate;
    const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
        // Consecutive day
        this.analytics.streakDays += 1;
    } else if (daysDiff > 1) {
        // Streak broken
        this.analytics.streakDays = 1;
    }
    // If daysDiff === 0, it's the same day, don't change streak
    
    this.analytics.lastStreakDate = today;
    return this;
};

// Static method to find enrolled courses for user
UserCourseSchema.statics.findEnrolledForUser = function(userId: string) {
    return this.find({ 
        userId,
        status: { $in: ['ENROLLED', 'IN_PROGRESS', 'COMPLETED'] }
    }).populate('courseId', 'title description category instructor duration level imageUrl');
};

// Static method to get user course statistics
UserCourseSchema.statics.getUserStats = function(userId: string) {
    return this.aggregate([
        { $match: { userId: new Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                totalEnrolled: { $sum: 1 },
                completed: {
                    $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
                },
                inProgress: {
                    $sum: { $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0] }
                },
                averageProgress: { $avg: '$progressPercent' },
                totalStudyTime: { $sum: '$studyTime' },
                totalPoints: { $sum: '$analytics.totalPoints' },
                totalAchievements: { $sum: { $size: '$achievements' } }
            }
        }
    ]);
};

export default model<IUserCourse, IUserCourseModel>('UserCourse', UserCourseSchema);
