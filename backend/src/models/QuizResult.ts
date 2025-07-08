import { Schema, model, Document, Model } from 'mongoose';

/**
 * Interface representing a Quiz Result document in MongoDB.
 */
export interface IQuizResult extends Document {
    studentId: Schema.Types.ObjectId;
    programmeId: Schema.Types.ObjectId;
    moduleId: Schema.Types.ObjectId;
    lessonId: Schema.Types.ObjectId;
    quizId?: string; // For identifying specific quiz within a lesson
    score: number;
    maxScore: number;
    percentage: number;
    passingScore: number;
    isPassed: boolean;
    timeSpent: number; // in minutes
    startedAt: Date;
    completedAt: Date;
    attempt: number;
    answers: {
        questionId: string;
        answer: any;
        isCorrect: boolean;
        pointsAwarded: number;
    }[];
    feedback?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Interface for QuizResult model with static methods
 */
export interface IQuizResultModel extends Model<IQuizResult> {
    getBestAttempt(studentId: string, lessonId: string): Promise<IQuizResult | null>;
    getAverageScore(studentId: string, programmeId: string): Promise<number>;
    getQuizStatistics(lessonId: string): Promise<any[]>;
}

const QuizResultSchema = new Schema<IQuizResult>(
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
            trim: true,
            index: true
        },
        score: {
            type: Number,
            required: true,
            min: 0
        },
        maxScore: {
            type: Number,
            required: true,
            min: 1
        },
        percentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        passingScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
            default: 70
        },
        isPassed: {
            type: Boolean,
            required: true,
            index: true
        },
        timeSpent: {
            type: Number,
            required: true,
            min: 0 // in minutes
        },
        startedAt: {
            type: Date,
            required: true
        },
        completedAt: {
            type: Date,
            required: true
        },
        attempt: {
            type: Number,
            required: true,
            min: 1,
            default: 1
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
            }
        }],
        feedback: {
            type: String,
            trim: true,
            maxlength: 1000
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
QuizResultSchema.index({ studentId: 1, programmeId: 1, lessonId: 1 });
QuizResultSchema.index({ studentId: 1, attempt: -1 });
QuizResultSchema.index({ isPassed: 1, completedAt: -1 });
QuizResultSchema.index({ lessonId: 1, attempt: 1 }, { unique: true });

// Virtual for grade letter
QuizResultSchema.virtual('grade').get(function() {
    if (this.percentage >= 90) return 'A';
    if (this.percentage >= 80) return 'B';
    if (this.percentage >= 70) return 'C';
    if (this.percentage >= 60) return 'D';
    return 'F';
});

// Method to calculate percentage
QuizResultSchema.methods.calculatePercentage = function() {
    this.percentage = Math.round((this.score / this.maxScore) * 100);
    this.isPassed = this.percentage >= this.passingScore;
    return this.percentage;
};

// Static method to get best attempt for a student on a specific lesson
QuizResultSchema.statics.getBestAttempt = function(studentId: string, lessonId: string) {
    return this.findOne({
        studentId,
        lessonId
    }).sort({ percentage: -1, completedAt: -1 });
};

// Static method to get average score for a student across a programme
QuizResultSchema.statics.getAverageScore = function(studentId: string, programmeId: string) {
    return this.aggregate([
        {
            $match: {
                studentId: new Schema.Types.ObjectId(studentId),
                programmeId: new Schema.Types.ObjectId(programmeId)
            }
        },
        {
            $group: {
                _id: '$lessonId',
                bestPercentage: { $max: '$percentage' }
            }
        },
        {
            $group: {
                _id: null,
                averageScore: { $avg: '$bestPercentage' }
            }
        }
    ]).then(result => result[0]?.averageScore || 0);
};

// Static method to get quiz statistics
QuizResultSchema.statics.getQuizStats = function(lessonId: string) {
    return this.aggregate([
        { $match: { lessonId: new Schema.Types.ObjectId(lessonId) } },
        {
            $group: {
                _id: '$studentId',
                bestScore: { $max: '$score' },
                bestPercentage: { $max: '$percentage' },
                attempts: { $sum: 1 },
                passed: { $max: '$isPassed' }
            }
        },
        {
            $group: {
                _id: null,
                totalStudents: { $sum: 1 },
                passedStudents: { $sum: { $cond: ['$passed', 1, 0] } },
                averageScore: { $avg: '$bestPercentage' },
                averageAttempts: { $avg: '$attempts' }
            }
        }
    ]);
};

export default model<IQuizResult, IQuizResultModel>('QuizResult', QuizResultSchema);
