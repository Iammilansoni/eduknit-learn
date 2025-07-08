import { Schema, model, Document } from 'mongoose';

/**
 * Interface representing a Programme Lesson document in MongoDB.
 */
export interface IProgrammeLesson extends Document {
    moduleId: Schema.Types.ObjectId;
    programmeId: Schema.Types.ObjectId;
    title: string;
    description: string;
    orderIndex: number;
    type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT' | 'INTERACTIVE' | 'DOCUMENT';
    content: {
        videoUrl?: string;
        videoDuration?: number; // in seconds
        textContent?: string;
        documentUrl?: string;
        interactiveElements?: any[];
    };
    estimatedDuration: number; // in minutes
    isRequired: boolean;
    prerequisites: Schema.Types.ObjectId[]; // Other lesson IDs
    learningObjectives: string[];
    resources: {
        title: string;
        url: string;
        type: 'PDF' | 'LINK' | 'VIDEO' | 'DOCUMENT';
    }[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ProgrammeLessonSchema = new Schema<IProgrammeLesson>(
    {
        moduleId: {
            type: Schema.Types.ObjectId,
            ref: 'ProgrammeModule',
            required: true,
            index: true
        },
        programmeId: {
            type: Schema.Types.ObjectId,
            ref: 'Programme',
            required: true,
            index: true
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        },
        orderIndex: {
            type: Number,
            required: true,
            min: 0,
            index: true
        },
        type: {
            type: String,
            enum: ['VIDEO', 'TEXT', 'QUIZ', 'ASSIGNMENT', 'INTERACTIVE', 'DOCUMENT'],
            required: true,
            index: true
        },
        content: {
            videoUrl: {
                type: String,
                trim: true
            },
            videoDuration: {
                type: Number,
                min: 0 // in seconds
            },
            textContent: {
                type: String,
                trim: true
            },
            documentUrl: {
                type: String,
                trim: true
            },
            interactiveElements: [{
                type: Schema.Types.Mixed
            }]
        },
        estimatedDuration: {
            type: Number,
            required: true,
            min: 1 // in minutes
        },
        isRequired: {
            type: Boolean,
            default: true
        },
        prerequisites: [{
            type: Schema.Types.ObjectId,
            ref: 'ProgrammeLesson'
        }],
        learningObjectives: [{
            type: String,
            trim: true,
            maxlength: 200
        }],
        resources: [{
            title: {
                type: String,
                required: true,
                trim: true,
                maxlength: 100
            },
            url: {
                type: String,
                required: true,
                trim: true
            },
            type: {
                type: String,
                enum: ['PDF', 'LINK', 'VIDEO', 'DOCUMENT'],
                required: true
            }
        }],
        isActive: {
            type: Boolean,
            default: true,
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
ProgrammeLessonSchema.index({ moduleId: 1, orderIndex: 1 });
ProgrammeLessonSchema.index({ programmeId: 1, isActive: 1 });
ProgrammeLessonSchema.index({ type: 1, isActive: 1 });

// Method to check if lesson is unlocked for a student
ProgrammeLessonSchema.methods.isUnlockedForStudent = function(studentId: string, completedLessons: string[]) {
    // First lesson is always unlocked
    if (this.orderIndex === 0) return true;
    
    // Check if all prerequisites are completed
    return this.prerequisites.every((prereqId: Schema.Types.ObjectId) => 
        completedLessons.includes(prereqId.toString())
    );
};

// Virtual for content summary
ProgrammeLessonSchema.virtual('contentSummary').get(function() {
    const summary: any = {
        type: this.type,
        estimatedDuration: this.estimatedDuration
    };
    
    if (this.type === 'VIDEO' && this.content.videoDuration) {
        summary.videoDuration = this.content.videoDuration;
    }
    
    return summary;
});

export default model<IProgrammeLesson>('ProgrammeLesson', ProgrammeLessonSchema);
