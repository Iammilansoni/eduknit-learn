import { Schema, model, Document } from 'mongoose';

/**
 * Interface representing an Audit Log document in MongoDB.
 */
export interface IAuditLog extends Document {
    userId: string;
    action: 'view' | 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export_data' | 'deletion_request';
    resource: string; // e.g., 'profile', 'user_data', 'settings'
    resourceId?: string;
    performedBy: string; // user ID who performed the action
    performedByRole: 'admin' | 'user' | 'student' | 'system';
    ipAddress?: string;
    userAgent?: string;
    details?: {
        previousValues?: any;
        newValues?: any;
        reason?: string;
        metadata?: any;
    };
    success: boolean;
    errorMessage?: string;
    timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
    {
        userId: {
            type: String,
            required: true,
            index: true
        },
        action: {
            type: String,
            enum: ['view', 'create', 'update', 'delete', 'login', 'logout', 'export_data', 'deletion_request'],
            required: true,
            index: true
        },
        resource: {
            type: String,
            required: true,
            index: true
        },
        resourceId: {
            type: String,
            index: true
        },
        performedBy: {
            type: String,
            required: true,
            index: true
        },
        performedByRole: {
            type: String,
            enum: ['admin', 'user', 'student', 'system'],
            required: true
        },
        ipAddress: {
            type: String
        },
        userAgent: {
            type: String
        },
        details: {
            previousValues: Schema.Types.Mixed,
            newValues: Schema.Types.Mixed,
            reason: String,
            metadata: Schema.Types.Mixed
        },
        success: {
            type: Boolean,
            required: true,
            default: true
        },
        errorMessage: {
            type: String
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: false, // We use our own timestamp field
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

// Compound indexes for efficient querying
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ performedBy: 1, timestamp: -1 });

// TTL index to automatically delete old audit logs after 2 years (optional)
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 }); // 2 years

const AuditLog = model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
