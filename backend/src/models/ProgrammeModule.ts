import { Schema, model, Document } from 'mongoose';

/**
 * Interface representing a Programme Module document in MongoDB.
 */
export interface IProgrammeModule extends Document {
    programmeId: Schema.Types.ObjectId;
    title: string;
    description: string;
    orderIndex: number;
    isUnlocked: boolean;
    estimatedDuration: number; // in minutes
    totalLessons: number;
    prerequisites: Schema.Types.ObjectId[]; // Other module IDs
    learningObjectives: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ProgrammeModuleSchema = new Schema<IProgrammeModule>(
    {
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
        isUnlocked: {
            type: Boolean,
            default: false
        },
        estimatedDuration: {
            type: Number,
            required: true,
            min: 1 // in minutes
        },
        totalLessons: {
            type: Number,
            required: true,
            min: 1
        },
        prerequisites: [{
            type: Schema.Types.ObjectId,
            ref: 'ProgrammeModule'
        }],
        learningObjectives: [{
            type: String,
            trim: true,
            maxlength: 200
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
ProgrammeModuleSchema.index({ programmeId: 1, orderIndex: 1 });
ProgrammeModuleSchema.index({ programmeId: 1, isActive: 1 });

// Method to check if module is unlocked for a student
ProgrammeModuleSchema.methods.isUnlockedForStudent = function(studentId: string, completedModules: string[]) {
    // First module is always unlocked
    if (this.orderIndex === 0) return true;
    
    // Check if all prerequisites are completed
    return this.prerequisites.every((prereqId: Schema.Types.ObjectId) => 
        completedModules.includes(prereqId.toString())
    );
};

export default model<IProgrammeModule>('ProgrammeModule', ProgrammeModuleSchema);
