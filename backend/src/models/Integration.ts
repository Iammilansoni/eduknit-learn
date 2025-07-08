import { Schema, model, Document } from 'mongoose';

export interface IIntegration extends Document {
  userId: Schema.Types.ObjectId;
  platform: 'discord' | 'slack' | 'teams' | 'zoom';
  enabled: boolean;
  config: {
    // Discord specific
    serverId?: string;
    channelId?: string;
    webhookUrl?: string;
    // General
    apiKey?: string;
    refreshToken?: string;
    accessToken?: string;
    expiresAt?: Date;
  };
  preferences: {
    notifications: boolean;
    announcements: boolean;
    progressUpdates: boolean;
    achievementSharing: boolean;
  };
  metadata: {
    lastSync?: Date;
    syncStatus?: 'success' | 'failed' | 'pending';
    errorMessage?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  // Instance methods
  isTokenExpired(): boolean;
  updateSyncStatus(status: 'success' | 'failed' | 'pending', errorMessage?: string): Promise<this>;
}

const IntegrationSchema = new Schema<IIntegration>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    platform: {
      type: String,
      enum: ['discord', 'slack', 'teams', 'zoom'],
      required: true,
      index: true
    },
    enabled: {
      type: Boolean,
      default: false
    },
    config: {
      serverId: { type: String },
      channelId: { type: String },
      webhookUrl: { type: String },
      apiKey: { type: String },
      refreshToken: { type: String },
      accessToken: { type: String },
      expiresAt: { type: Date }
    },
    preferences: {
      notifications: { type: Boolean, default: true },
      announcements: { type: Boolean, default: true },
      progressUpdates: { type: Boolean, default: false },
      achievementSharing: { type: Boolean, default: false }
    },
    metadata: {
      lastSync: { type: Date },
      syncStatus: {
        type: String,
        enum: ['success', 'failed', 'pending'],
        default: 'pending'
      },
      errorMessage: { type: String }
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete (ret as any)._id;
        delete (ret as any).__v;
        // Remove sensitive data from API responses
        if (ret.config) {
          delete ret.config.apiKey;
          delete ret.config.refreshToken;
          delete ret.config.accessToken;
        }
        return ret;
      }
    }
  }
);

// Compound index for user + platform
IntegrationSchema.index({ userId: 1, platform: 1 }, { unique: true });

// Instance methods
IntegrationSchema.methods.isTokenExpired = function() {
  if (!this.config.expiresAt) return false;
  return new Date() > this.config.expiresAt;
};

IntegrationSchema.methods.updateSyncStatus = function(status: 'success' | 'failed' | 'pending', errorMessage?: string) {
  this.metadata.syncStatus = status;
  this.metadata.lastSync = new Date();
  if (errorMessage) {
    this.metadata.errorMessage = errorMessage;
  } else {
    this.metadata.errorMessage = undefined;
  }
  return this.save();
};

export default model<IIntegration>('Integration', IntegrationSchema);
