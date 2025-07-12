import { Schema, model, Document, Model } from 'mongoose';

/**
 * Interface representing a Quiz Attempt document in MongoDB.
 * This tracks individual quiz attempts by students.
 */
export interface IQuizAttempt extends Document {
    studentId: Schema.Types.ObjectId;
    programmeId: Schema.Types.ObjectId;
    moduleId: Schema.Types.ObjectId;
    lessonId: Schema.Types.ObjectId;
    quizId: string;
    
    // Attempt details
    attemptNumber: number;
    startedAt: Date;
    completedAt?: Date;
    timeSpent: number; // in seconds
    
    // Scoring
    score: number;
    maxScore: number;
    percentage: number;
    isPassed: boolean;
    passingScore: number;
    
    // Question responses
    answers: {
        questionId: string;
        answer: any; // Could be string, array of strings, or boolean
        isCorrect: boolean;
        pointsAwarded: number;
        timeSpent?: number; // time spent on this question
    }[];
    
    // Settings applied during attempt
    settings: {
        timeLimit?: number; // in minutes
        questionsRandomized: boolean;
        optionsRandomized: boolean;
        allowMultipleAttempts: boolean;
        showCorrectAnswers: boolean;
        showFeedback: boolean;
    };
    
    // Feedback and review
    feedback?: string;
    reviewNotes?: string;
    flaggedForReview?: boolean;
    
    // Status tracking
    status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED' | 'EXPIRED';
    isDeleted: boolean;
}

export interface IQuizAttemptModel extends Model<IQuizAttempt> {
    // Find best attempt for a student on a specific lesson
    findBestAttempt(studentId: string, lessonId: string): Promise<IQuizAttempt | null>;
    
    // Get all attempts for a student on a specific lesson
    findStudentAttempts(studentId: string, lessonId: string): Promise<IQuizAttempt[]>;
    
    // Get quiz analytics for a lesson
    getQuizAnalytics(lessonId: string): Promise<any>;
    
    // Get student quiz performance across all courses
    getStudentQuizPerformance(studentId: string): Promise<any>;
}

const QuizAttemptSchema = new Schema<IQuizAttempt>(
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
        quizId: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        attemptNumber: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },
        startedAt: {
            type: Date,
            default: Date.now,
            required: true
        },
        completedAt: {
            type: Date,
            index: true
        },
        timeSpent: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        score: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        maxScore: {
            type: Number,
            required: true,
            min: 0
        },
        percentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
            default: 0
        },
        isPassed: {
            type: Boolean,
            required: true,
            default: false
        },
        passingScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
            default: 60
        },
        answers: [{
            questionId: {
                type: String,
                required: true
            },
            answer: {
                type: Schema.Types.Mixed,
                required: true
            },
            isCorrect: {
                type: Boolean,
                required: true
            },
            pointsAwarded: {
                type: Number,
                required: true,
                min: 0
            },
            timeSpent: {
                type: Number,
                min: 0
            }
        }],
        settings: {
            timeLimit: {
                type: Number,
                min: 1
            },
            questionsRandomized: {
                type: Boolean,
                default: false
            },
            optionsRandomized: {
                type: Boolean,
                default: false
            },
            allowMultipleAttempts: {
                type: Boolean,
                default: true
            },
            showCorrectAnswers: {
                type: Boolean,
                default: true
            },
            showFeedback: {
                type: Boolean,
                default: true
            }
        },
        feedback: {
            type: String,
            trim: true,
            maxlength: 1000
        },
        reviewNotes: {
            type: String,
            trim: true,
            maxlength: 500
        },
        flaggedForReview: {
            type: Boolean,
            default: false
        },
        status: {
            type: String,
            enum: ['IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'EXPIRED'],
            default: 'IN_PROGRESS',
            index: true
        },
        isDeleted: {
            type: Boolean,
            default: false,
            index: true
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
QuizAttemptSchema.index({ studentId: 1, lessonId: 1, attemptNumber: 1 }, { unique: true });
QuizAttemptSchema.index({ studentId: 1, status: 1, completedAt: -1 });
QuizAttemptSchema.index({ lessonId: 1, isPassed: 1, completedAt: -1 });
QuizAttemptSchema.index({ programmeId: 1, completedAt: -1 });

// Virtual for grade letter
QuizAttemptSchema.virtual('gradeLetter').get(function() {
    if (this.percentage >= 90) return 'A';
    if (this.percentage >= 80) return 'B';
    if (this.percentage >= 70) return 'C';
    if (this.percentage >= 60) return 'D';
    return 'F';
});

// Virtual for duration in minutes
QuizAttemptSchema.virtual('durationMinutes').get(function() {
    return Math.round(this.timeSpent / 60);
});

// Method to calculate percentage and pass status
QuizAttemptSchema.methods.calculateResults = function() {
    this.percentage = Math.round((this.score / this.maxScore) * 100);
    this.isPassed = this.percentage >= this.passingScore;
    return {
        percentage: this.percentage,
        isPassed: this.isPassed,
        gradeLetter: this.gradeLetter
    };
};

// Static method to find best attempt
QuizAttemptSchema.statics.findBestAttempt = function(studentId: string, lessonId: string) {
    return this.findOne({
        studentId,
        lessonId,
        status: 'COMPLETED',
        isDeleted: false
    }).sort({ score: -1, percentage: -1, completedAt: -1 }).exec();
};

// Static method to find all attempts for a student
QuizAttemptSchema.statics.findStudentAttempts = function(studentId: string, lessonId: string) {
    return this.find({
        studentId,
        lessonId,
        isDeleted: false
    }).sort({ attemptNumber: -1 }).exec();
};

// Static method to get quiz analytics
QuizAttemptSchema.statics.getQuizAnalytics = function(lessonId: string) {
    return this.aggregate([
        {
            $match: {
                lessonId: new Schema.Types.ObjectId(lessonId),
                status: 'COMPLETED',
                isDeleted: false
            }
        },
        {
            $group: {
                _id: null,
                totalAttempts: { $sum: 1 },
                uniqueStudents: { $addToSet: '$studentId' },
                averageScore: { $avg: '$percentage' },
                passRate: {
                    $avg: { $cond: ['$isPassed', 1, 0] }
                },
                averageTimeSpent: { $avg: '$timeSpent' },
                highestScore: { $max: '$percentage' },
                lowestScore: { $min: '$percentage' }
            }
        },
        {
            $project: {
                _id: 0,
                totalAttempts: 1,
                uniqueStudents: { $size: '$uniqueStudents' },
                averageScore: { $round: ['$averageScore', 1] },
                passRate: { $round: [{ $multiply: ['$passRate', 100] }, 1] },
                averageTimeSpent: { $round: ['$averageTimeSpent', 0] },
                highestScore: 1,
                lowestScore: 1
            }
        }
    ]);
};

// Static method to get student quiz performance
QuizAttemptSchema.statics.getStudentQuizPerformance = function(studentId: string) {
    return this.aggregate([
        {
            $match: {
                studentId: new Schema.Types.ObjectId(studentId),
                status: 'COMPLETED',
                isDeleted: false
            }
        },
        {
            $group: {
                _id: '$programmeId',
                totalQuizzes: { $sum: 1 },
                averageScore: { $avg: '$percentage' },
                passedQuizzes: {
                    $sum: { $cond: ['$isPassed', 1, 0] }
                },
                totalTimeSpent: { $sum: '$timeSpent' },
                bestScore: { $max: '$percentage' },
                recentActivity: { $max: '$completedAt' }
            }
        },
        {
            $lookup: {
                from: 'programmes',
                localField: '_id',
                foreignField: '_id',
                as: 'programme'
            }
        },
        {
            $unwind: '$programme'
        },
        {
            $project: {
                programmeTitle: '$programme.title',
                totalQuizzes: 1,
                averageScore: { $round: ['$averageScore', 1] },
                passRate: {
                    $round: [
                        { $multiply: [{ $divide: ['$passedQuizzes', '$totalQuizzes'] }, 100] },
                        1
                    ]
                },
                totalTimeSpent: 1,
                bestScore: 1,
                recentActivity: 1
            }
        },
        {
            $sort: { recentActivity: -1 }
        }
    ]);
};

export default model<IQuizAttempt, IQuizAttemptModel>('QuizAttempt', QuizAttemptSchema);
