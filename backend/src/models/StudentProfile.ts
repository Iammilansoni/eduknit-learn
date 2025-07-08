import { Schema, model, Document } from 'mongoose';

/**
 * Interface representing a Student Profile document in MongoDB.
 * This extends the basic user information with student-specific data.
 */
export interface IStudentProfile extends Document {
    userId: Schema.Types.ObjectId;
    contactInfo: {
        phoneNumber?: string;
        alternateEmail?: string;
        socialMedia?: {
            linkedin?: string;
            twitter?: string;
            github?: string;
            portfolio?: string;
        };
    };
    address: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
        timezone?: string;
    };
    profilePhoto: {
        url?: string;
        filename?: string;
        uploadDate?: Date;
        size?: number; // in bytes
        mimeType?: string;
    };
    academicInfo: {
        educationLevel: 'HIGH_SCHOOL' | 'UNDERGRADUATE' | 'GRADUATE' | 'POSTGRADUATE' | 'OTHER';
        institution?: string;
        fieldOfStudy?: string;
        graduationYear?: number;
        currentlyStudying: boolean;
    };
    professionalInfo: {
        currentPosition?: string;
        company?: string;
        industry?: string;
        experience: 'STUDENT' | '0-1' | '1-3' | '3-5' | '5-10' | '10+';
        skills: string[];
        interests: string[];
    };
    learningPreferences: {
        preferredLearningStyle: 'VISUAL' | 'AUDITORY' | 'KINESTHETIC' | 'READING_WRITING';
        goals: string[];
        availabilityHours: number; // hours per week
        preferredTimeSlots: string[]; // e.g., ['morning', 'evening']
        notificationPreferences: {
            email: boolean;
            sms: boolean;
            push: boolean;
            frequency: 'IMMEDIATE' | 'DAILY' | 'WEEKLY' | 'NEVER';
        };
    };
    privacy: {
        profileVisibility: 'PUBLIC' | 'PRIVATE' | 'CONNECTIONS_ONLY';
        allowMessaging: boolean;
        allowConnectionRequests: boolean;
        dataProcessingConsent: boolean;
        marketingConsent: boolean;
        dataProcessingConsentDate?: Date;
        marketingConsentDate?: Date;
    };
    gamification: {
        totalPoints: number;
        level: number;
        badges: [{
            badgeId: string;
            name: string;
            description: string;
            earnedDate: Date;
            category: 'COMPLETION' | 'ACHIEVEMENT' | 'PARTICIPATION' | 'STREAK';
        }];
        streaks: {
            currentLoginStreak: number;
            longestLoginStreak: number;
            currentLearningStreak: number;
            longestLearningStreak: number;
        };
    };
    statistics: {
        totalCoursesEnrolled: number;
        totalCoursesCompleted: number;
        totalCertificatesEarned: number;
        totalLearningHours: number;
        averageScore: number;
        joinDate: Date;
        lastActiveDate: Date;
        profileCompleteness: number; // percentage
    };
    metadata: {
        onboardingCompleted: boolean;
        onboardingCompletedDate?: Date;
        profileSetupStep: number; // for guided profile setup
        lastProfileUpdate: Date;
        dataVersion: number; // for migration purposes
    };
    createdAt: Date;
    updatedAt: Date;
    
    // Instance methods
    updateProfileCompleteness(): this;
    addBadge(badgeData: any): boolean;
    updateLearningStreak(): this;
    calculatedCompleteness: number;
    
    // Index signature to allow dynamic property access
    [key: string]: any;
}

const StudentProfileSchema = new Schema<IStudentProfile>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true
        },
        contactInfo: {
            phoneNumber: {
                type: String,
                trim: true,
                validate: {
                    validator: function(phone: string) {
                        return !phone || /^\+?[\d\s\-\(\)]{10,15}$/.test(phone);
                    },
                    message: 'Please enter a valid phone number'
                }
            },
            alternateEmail: {
                type: String,
                trim: true,
                lowercase: true,
                validate: {
                    validator: function(email: string) {
                        return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                    },
                    message: 'Please enter a valid email address'
                }
            },
            socialMedia: {
                linkedin: {
                    type: String,
                    trim: true,
                    validate: {
                        validator: function(url: string) {
                            return !url || /^https?:\/\/(www\.)?linkedin\.com\//.test(url);
                        },
                        message: 'Please enter a valid LinkedIn URL'
                    }
                },
                twitter: {
                    type: String,
                    trim: true,
                    validate: {
                        validator: function(url: string) {
                            return !url || /^https?:\/\/(www\.)?twitter\.com\//.test(url);
                        },
                        message: 'Please enter a valid Twitter URL'
                    }
                },
                github: {
                    type: String,
                    trim: true,
                    validate: {
                        validator: function(url: string) {
                            return !url || /^https?:\/\/(www\.)?github\.com\//.test(url);
                        },
                        message: 'Please enter a valid GitHub URL'
                    }
                },
                portfolio: {
                    type: String,
                    trim: true,
                    validate: {
                        validator: function(url: string) {
                            return !url || /^https?:\/\//.test(url);
                        },
                        message: 'Please enter a valid URL'
                    }
                }
            }
        },
        address: {
            street: {
                type: String,
                trim: true,
                maxlength: 200
            },
            city: {
                type: String,
                trim: true,
                maxlength: 100,
                index: true
            },
            state: {
                type: String,
                trim: true,
                maxlength: 100
            },
            postalCode: {
                type: String,
                trim: true,
                maxlength: 20
            },
            country: {
                type: String,
                trim: true,
                maxlength: 100,
                index: true
            },
            timezone: {
                type: String,
                trim: true,
                default: 'UTC'
            }
        },
        profilePhoto: {
            url: {
                type: String,
                trim: true
            },
            filename: {
                type: String,
                trim: true
            },
            uploadDate: {
                type: Date
            },
            size: {
                type: Number,
                min: 0
            },
            mimeType: {
                type: String,
                trim: true
            }
        },
        academicInfo: {
            educationLevel: {
                type: String,
                enum: ['HIGH_SCHOOL', 'UNDERGRADUATE', 'GRADUATE', 'POSTGRADUATE', 'OTHER'],
                index: true
            },
            institution: {
                type: String,
                trim: true,
                maxlength: 200
            },
            fieldOfStudy: {
                type: String,
                trim: true,
                maxlength: 100
            },
            graduationYear: {
                type: Number,
                min: 1950,
                max: new Date().getFullYear() + 10
            },
            currentlyStudying: {
                type: Boolean,
                default: false
            }
        },
        professionalInfo: {
            currentPosition: {
                type: String,
                trim: true,
                maxlength: 100
            },
            company: {
                type: String,
                trim: true,
                maxlength: 200
            },
            industry: {
                type: String,
                trim: true,
                maxlength: 100,
                index: true
            },
            experience: {
                type: String,
                enum: ['STUDENT', '0-1', '1-3', '3-5', '5-10', '10+'],
                default: 'STUDENT',
                index: true
            },
            skills: [{
                type: String,
                trim: true,
                maxlength: 50
            }],
            interests: [{
                type: String,
                trim: true,
                maxlength: 50
            }]
        },
        learningPreferences: {
            preferredLearningStyle: {
                type: String,
                enum: ['VISUAL', 'AUDITORY', 'KINESTHETIC', 'READING_WRITING'],
                default: 'VISUAL'
            },
            goals: [{
                type: String,
                trim: true,
                maxlength: 200
            }],
            availabilityHours: {
                type: Number,
                min: 0,
                max: 168, // hours in a week
                default: 5
            },
            preferredTimeSlots: [{
                type: String,
                enum: ['early_morning', 'morning', 'afternoon', 'evening', 'night', 'late_night']
            }],
            notificationPreferences: {
                email: {
                    type: Boolean,
                    default: true
                },
                sms: {
                    type: Boolean,
                    default: false
                },
                push: {
                    type: Boolean,
                    default: true
                },
                frequency: {
                    type: String,
                    enum: ['IMMEDIATE', 'DAILY', 'WEEKLY', 'NEVER'],
                    default: 'DAILY'
                }
            }
        },
        privacy: {
            profileVisibility: {
                type: String,
                enum: ['PUBLIC', 'PRIVATE', 'CONNECTIONS_ONLY'],
                default: 'PRIVATE'
            },
            allowMessaging: {
                type: Boolean,
                default: true
            },
            allowConnectionRequests: {
                type: Boolean,
                default: true
            },
            dataProcessingConsent: {
                type: Boolean,
                required: true,
                default: false
            },
            marketingConsent: {
                type: Boolean,
                default: false
            },
            dataProcessingConsentDate: {
                type: Date
            },
            marketingConsentDate: {
                type: Date
            }
        },
        gamification: {
            totalPoints: {
                type: Number,
                default: 0,
                min: 0,
                index: true
            },
            level: {
                type: Number,
                default: 1,
                min: 1,
                index: true
            },
            badges: [{
                badgeId: {
                    type: String,
                    required: true
                },
                name: {
                    type: String,
                    required: true
                },
                description: {
                    type: String,
                    required: true
                },
                earnedDate: {
                    type: Date,
                    default: Date.now
                },
                category: {
                    type: String,
                    enum: ['COMPLETION', 'ACHIEVEMENT', 'PARTICIPATION', 'STREAK'],
                    required: true
                }
            }],
            streaks: {
                currentLoginStreak: {
                    type: Number,
                    default: 0,
                    min: 0
                },
                longestLoginStreak: {
                    type: Number,
                    default: 0,
                    min: 0
                },
                currentLearningStreak: {
                    type: Number,
                    default: 0,
                    min: 0
                },
                longestLearningStreak: {
                    type: Number,
                    default: 0,
                    min: 0
                }
            }
        },
        statistics: {
            totalCoursesEnrolled: {
                type: Number,
                default: 0,
                min: 0
            },
            totalCoursesCompleted: {
                type: Number,
                default: 0,
                min: 0
            },
            totalCertificatesEarned: {
                type: Number,
                default: 0,
                min: 0
            },
            totalLearningHours: {
                type: Number,
                default: 0,
                min: 0
            },
            averageScore: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            },
            joinDate: {
                type: Date,
                default: Date.now
            },
            lastActiveDate: {
                type: Date,
                default: Date.now
            },
            profileCompleteness: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            }
        },
        metadata: {
            onboardingCompleted: {
                type: Boolean,
                default: false
            },
            onboardingCompletedDate: {
                type: Date
            },
            profileSetupStep: {
                type: Number,
                default: 0,
                min: 0
            },
            lastProfileUpdate: {
                type: Date,
                default: Date.now
            },
            dataVersion: {
                type: Number,
                default: 1
            }
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform: function(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                return ret;
            }
        }
    }
);

// Indexes for better query performance
StudentProfileSchema.index({ 'address.country': 1, 'address.city': 1 });
StudentProfileSchema.index({ 'academicInfo.educationLevel': 1 });
StudentProfileSchema.index({ 'professionalInfo.industry': 1, 'professionalInfo.experience': 1 });
StudentProfileSchema.index({ 'gamification.totalPoints': -1 });
StudentProfileSchema.index({ 'statistics.totalCoursesCompleted': -1 });
StudentProfileSchema.index({ 'statistics.lastActiveDate': -1 });

// Virtual for full name (combining with user data)
StudentProfileSchema.virtual('fullAddress').get(function() {
    const addr = this.address;
    const parts = [addr.street, addr.city, addr.state, addr.postalCode, addr.country]
        .filter(Boolean);
    return parts.join(', ');
});

// Virtual for profile completion percentage calculation
StudentProfileSchema.virtual('calculatedCompleteness').get(function() {
    let completeness = 0;
    const totalFields = 14; // Define how many key fields we're tracking (removed profile photo)
    
    // Contact info (3 points)
    if (this.contactInfo.phoneNumber) completeness += 1;
    if (this.contactInfo.alternateEmail) completeness += 1;
    if (Object.values(this.contactInfo.socialMedia || {}).some(v => v)) completeness += 1;
    
    // Address (2 points)
    if (this.address.city && this.address.country) completeness += 2;
    
    // Academic info (2 points)
    if (this.academicInfo.educationLevel) completeness += 1;
    if (this.academicInfo.institution) completeness += 1;
    
    // Professional info (3 points)
    if (this.professionalInfo.experience) completeness += 1;
    if (this.professionalInfo.skills.length > 0) completeness += 1;
    if (this.professionalInfo.interests.length > 0) completeness += 1;
    
    // Learning preferences (3 points)
    if (this.learningPreferences.goals.length > 0) completeness += 1;
    if (this.learningPreferences.availabilityHours > 0) completeness += 1;
    if (this.learningPreferences.preferredTimeSlots.length > 0) completeness += 1;
    
    return Math.round((completeness / totalFields) * 100);
});

// Method to calculate and update profile completeness
StudentProfileSchema.methods.updateProfileCompleteness = function() {
    this.statistics.profileCompleteness = this.calculatedCompleteness;
    this.metadata.lastProfileUpdate = new Date();
    return this;
};

// Method to add badge
StudentProfileSchema.methods.addBadge = function(badgeData: any) {
    const existingBadge = this.gamification.badges.find(
        (badge: any) => badge.badgeId === badgeData.badgeId
    );
    
    if (!existingBadge) {
        this.gamification.badges.push(badgeData);
        return true;
    }
    return false;
};

// Method to update learning streak
StudentProfileSchema.methods.updateLearningStreak = function() {
    const today = new Date();
    const lastActive = this.statistics.lastActiveDate;
    
    if (lastActive) {
        const daysDiff = Math.floor(
            (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysDiff === 1) {
            // Consecutive day
            this.gamification.streaks.currentLearningStreak += 1;
            if (this.gamification.streaks.currentLearningStreak > this.gamification.streaks.longestLearningStreak) {
                this.gamification.streaks.longestLearningStreak = this.gamification.streaks.currentLearningStreak;
            }
        } else if (daysDiff > 1) {
            // Streak broken
            this.gamification.streaks.currentLearningStreak = 1;
        }
        // If daysDiff === 0, same day, don't change streak
    } else {
        // First activity
        this.gamification.streaks.currentLearningStreak = 1;
        this.gamification.streaks.longestLearningStreak = 1;
    }
    
    this.statistics.lastActiveDate = today;
    return this;
};

// Static method to find profiles by criteria
StudentProfileSchema.statics.findByCriteria = function(criteria: any) {
    const query: any = {};
    
    if (criteria.country) {
        query['address.country'] = criteria.country;
    }
    if (criteria.city) {
        query['address.city'] = criteria.city;
    }
    if (criteria.educationLevel) {
        query['academicInfo.educationLevel'] = criteria.educationLevel;
    }
    if (criteria.industry) {
        query['professionalInfo.industry'] = criteria.industry;
    }
    if (criteria.experience) {
        query['professionalInfo.experience'] = criteria.experience;
    }
    
    return this.find(query).populate('userId', 'username email firstName lastName');
};

// Static method to get leaderboard
StudentProfileSchema.statics.getLeaderboard = function(limit: number = 10) {
    return this.find({})
        .sort({ 'gamification.totalPoints': -1 })
        .limit(limit)
        .populate('userId', 'username firstName lastName')
        .select('userId gamification.totalPoints gamification.level statistics.totalCoursesCompleted');
};

export default model<IStudentProfile>('StudentProfile', StudentProfileSchema);
