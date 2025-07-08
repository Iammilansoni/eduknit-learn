import { Schema, model, Document } from 'mongoose';

/**
 * Interface representing a Data Deletion Request document in MongoDB.
 */
export interface IDataDeletionRequest extends Document {
    userId: string;
    requestedBy: string; // user ID who made the request
    reason: string;
    requestType: 'account_deletion' | 'data_export' | 'data_deletion';
    status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
    adminNotes?: string;
    processedBy?: string; // admin user ID who processed the request
    processedAt?: Date;
    scheduledFor?: Date;
    dataExported?: boolean;
    exportedData?: {
        filename: string;
        downloadUrl?: string;
        expiresAt: Date;
    };
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const DataDeletionRequestSchema = new Schema<IDataDeletionRequest>(
    {
        userId: {
            type: String,
            required: true,
            index: true
        },
        requestedBy: {
            type: String,
            required: true
        },
        reason: {
            type: String,
            required: true,
            maxlength: 1000
        },
        requestType: {
            type: String,
            enum: ['account_deletion', 'data_export', 'data_deletion'],
            required: true,
            default: 'account_deletion'
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
            required: true,
            default: 'pending',
            index: true
        },
        adminNotes: {
            type: String,
            maxlength: 1000
        },
        processedBy: {
            type: String // Admin user ID
        },
        processedAt: {
            type: Date
        },
        scheduledFor: {
            type: Date
        },
        dataExported: {
            type: Boolean,
            default: false
        },
        exportedData: {
            filename: String,
            downloadUrl: String,
            expiresAt: Date
        },
        completedAt: {
            type: Date
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

// Indexes for efficient querying
DataDeletionRequestSchema.index({ userId: 1, status: 1 });
DataDeletionRequestSchema.index({ status: 1, createdAt: -1 });
DataDeletionRequestSchema.index({ processedBy: 1, processedAt: -1 });

const DataDeletionRequest = model<IDataDeletionRequest>('DataDeletionRequest', DataDeletionRequestSchema);

export default DataDeletionRequest;
