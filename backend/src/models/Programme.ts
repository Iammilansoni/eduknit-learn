import { Schema, model, Document } from 'mongoose';

/**
 * Interface representing a Programme/Course document in MongoDB.
 */
export interface IProgramme extends Document {
    title: string;
    description: string;
    category: 'AI_CERTIFICATE' | 'DATA_CERTIFICATION' | 'PROFESSIONAL_SKILLS' | 'TECHNICAL_SKILLS';
    instructor: string;
    duration: string; // e.g., "3-5 hours/week"
    timeframe: string; // e.g., "1-2 months"
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS';
    price: number;
    currency: string;
    imageUrl?: string;
    overview: string;
    skills: string[];
    prerequisites: string[];
    isActive: boolean;
    totalModules: number;
    totalLessons: number;
    estimatedDuration: number; // in hours
    durationDays: number; // Total course duration in days for progress calculation
    certificateAwarded: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: Schema.Types.ObjectId;
    lastModifiedBy: Schema.Types.ObjectId;
}

const ProgrammeSchema = new Schema<IProgramme>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
            index: true
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        },
        category: {
            type: String,
            enum: ['AI_CERTIFICATE', 'DATA_CERTIFICATION', 'PROFESSIONAL_SKILLS', 'TECHNICAL_SKILLS'],
            required: true,
            index: true
        },
        instructor: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        duration: {
            type: String,
            required: true,
            trim: true
        },
        timeframe: {
            type: String,
            required: true,
            trim: true
        },
        level: {
            type: String,
            enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS'],
            required: true,
            index: true
        },
        price: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        currency: {
            type: String,
            required: true,
            default: 'USD',
            maxlength: 3
        },
        imageUrl: {
            type: String,
            trim: true
        },
        overview: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        },
        skills: [{
            type: String,
            trim: true,
            maxlength: 100
        }],
        prerequisites: [{
            type: String,
            trim: true,
            maxlength: 200
        }],
        isActive: {
            type: Boolean,
            default: true,
            index: true
        },
        totalModules: {
            type: Number,
            required: true,
            min: 1
        },
        totalLessons: {
            type: Number,
            required: true,
            min: 1
        },
        estimatedDuration: {
            type: Number,
            required: true,
            min: 1 // in hours
        },
        durationDays: {
            type: Number,
            required: true,
            min: 1, // Total course duration in days for progress calculation
            default: 30
        },
        certificateAwarded: {
            type: Boolean,
            default: true
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        lastModifiedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
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

// Indexes for better query performance
ProgrammeSchema.index({ title: 'text', description: 'text', skills: 'text' });
ProgrammeSchema.index({ category: 1, level: 1 });
ProgrammeSchema.index({ isActive: 1, createdAt: -1 });
ProgrammeSchema.index({ instructor: 1 });

// Virtual for search relevance
ProgrammeSchema.virtual('searchRelevance').get(function() {
    return {
        title: this.title,
        description: this.description,
        skills: this.skills,
        category: this.category
    };
});

// Method to check if programme is available for enrollment
ProgrammeSchema.methods.isAvailableForEnrollment = function() {
    return this.isActive;
};

// Static method to find programmes by category
ProgrammeSchema.statics.findByCategory = function(category: string) {
    return this.find({ category, isActive: true }).sort({ createdAt: -1 });
};

// Static method to search programmes
ProgrammeSchema.statics.searchProgrammes = function(query: string, filters: any = {}) {
    const searchCriteria: any = {
        isActive: true,
        ...filters
    };
    
    if (query) {
        searchCriteria.$text = { $search: query };
    }
    
    return this.find(searchCriteria)
        .sort(query ? { score: { $meta: 'textScore' } } : { createdAt: -1 });
};

export default model<IProgramme>('Programme', ProgrammeSchema);
