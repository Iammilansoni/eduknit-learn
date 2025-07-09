import { Schema, model, Document } from 'mongoose';

/**
 * Interface representing a Lesson Completion document in MongoDB.
 */
export interface ILessonCompletion extends Document {
    userId: Schema.Types.ObjectId;
    courseId: Schema.Types.ObjectId;
    moduleId: Schema.Types.ObjectId;
    lessonId: Schema.Types.ObjectId;
    completedAt: Date;
    timeSpent: number; // in minutes
    score?: number; // if lesson has assessment
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const LessonCompletionSchema = new Schema<ILessonCompletion>(
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
        completedAt: {
            type: Date,
            default: Date.now,
            required: true
        },
        timeSpent: {
            type: Number,
            required: true,
            min: 0, // in minutes
            default: 0
        },
        score: {
            type: Number,
            min: 0,
            max: 100
        },
        notes: {
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
LessonCompletionSchema.index({ userId: 1, courseId: 1 });
LessonCompletionSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
LessonCompletionSchema.index({ completedAt: -1 });

export default model<ILessonCompletion>('LessonCompletion', LessonCompletionSchema);
