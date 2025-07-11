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
        // Legacy support - simple content types
        videoUrl?: string;
        videoDuration?: number; // in seconds
        textContent?: string;
        documentUrl?: string;
        interactiveElements?: any[];
        
        // Rich content support - structured JSON blocks
        richContent?: {
            id: string;
            type: 'text' | 'video' | 'image' | 'code' | 'interactive' | 'embed';
            title?: string;
            content: string;
            metadata?: {
                duration?: number;
                url?: string;
                alt?: string;
                language?: string;
                width?: number;
                height?: number;
                autoplay?: boolean;
                controls?: boolean;
            };
        }[];
        
        // Content format indicator
        contentFormat?: 'HTML' | 'JSON' | 'LEGACY';
        
        quiz?: {
            questions: {
                id: string;
                question: string;
                type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
                options?: string[];
                correctAnswer: any;
                points: number;
            }[];
            timeLimit?: number; // in minutes
            passingScore: number;
        };
    };
    estimatedDuration: number; // in minutes
    duration: number; // in minutes - alias for estimatedDuration
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
            // Legacy support
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
            }],
            
            // Rich content support
            richContent: [{
                id: {
                    type: String,
                    required: true
                },
                type: {
                    type: String,
                    enum: ['text', 'video', 'image', 'code', 'interactive', 'embed'],
                    required: true
                },
                title: {
                    type: String,
                    trim: true
                },
                content: {
                    type: String
                },
                metadata: {
                    type: Schema.Types.Mixed
                }
            }],
            
            // Content format indicator
            contentFormat: {
                type: String,
                enum: ['HTML', 'JSON', 'LEGACY'],
                default: 'LEGACY'
            },
            
            quiz: {
                questions: [{
                    id: {
                        type: String,
                        required: true
                    },
                    question: {
                        type: String,
                        required: true
                    },
                    type: {
                        type: String,
                        enum: ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER'],
                        required: true
                    },
                    options: [{
                        type: String
                    }],
                    correctAnswer: {
                        type: Schema.Types.Mixed,
                        required: true
                    },
                    points: {
                        type: Number,
                        required: true
                    }
                }],
                timeLimit: {
                    type: Number,
                    min: 0
                },
                passingScore: {
                    type: Number,
                    min: 0,
                    max: 100
                }
            }
        },
        estimatedDuration: {
            type: Number,
            required: true,
            min: 1 // in minutes
        },
        duration: {
            type: Number,
            min: 1 // in minutes - alias for estimatedDuration
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
