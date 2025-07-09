import { z } from 'zod';

// Basic Information Schema
export const basicInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
});

// Contact Information Schema
export const contactInfoSchema = z.object({
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  alternateEmail: z.string().email('Invalid email format').optional(),
});

// Address Schema
export const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
});

// Academic Information Schema
export const academicInfoSchema = z.object({
  educationLevel: z.enum(['HIGH_SCHOOL', 'UNDERGRADUATE', 'GRADUATE', 'POSTGRADUATE', 'OTHER']).optional(),
  institution: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  graduationYear: z.number().min(1900).max(new Date().getFullYear() + 10).optional(),
  currentlyStudying: z.boolean().optional(),
});

// Professional Information Schema
export const professionalInfoSchema = z.object({
  currentPosition: z.string().optional(),
  company: z.string().optional(),
  industry: z.string().optional(),
  experience: z.enum(['STUDENT', '0-1', '1-3', '3-5', '5-10', '10+']).optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
});

// Learning Preferences Schema
export const learningPreferencesSchema = z.object({
  preferredLearningStyle: z.enum(['VISUAL', 'AUDITORY', 'KINESTHETIC', 'READING_WRITING']).optional(),
  learningStyle: z.enum(['VISUAL', 'AUDITORY', 'KINESTHETIC', 'READING_WRITING']).optional(),
  goals: z.array(z.string()).optional(),
  availabilityHours: z.number().min(1).max(24).optional(),
  preferredTimeSlots: z.array(z.string()).optional(),
  studyTimePreference: z.enum(['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT']).optional(),
  difficultyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  preferredLanguages: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  notificationPreferences: z.object({
    email: z.boolean().optional(),
    sms: z.boolean().optional(),
    push: z.boolean().optional(),
    frequency: z.enum(['IMMEDIATE', 'DAILY', 'WEEKLY', 'NEVER']).optional(),
  }).optional(),
});

// Privacy Settings Schema
export const privacySchema = z.object({
  profileVisibility: z.enum(['PUBLIC', 'PRIVATE', 'CONNECTIONS_ONLY']).optional(),
  allowMessaging: z.boolean().optional(),
  allowConnectionRequests: z.boolean().optional(),
  dataProcessingConsent: z.boolean().optional(),
  marketingConsent: z.boolean().optional(),
  showProgress: z.boolean().optional(),
  showAchievements: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
});

// Merged Personal Information Schema (combines basic, contact, and address)
export const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  alternateEmail: z.string().email('Invalid email format').optional(),

  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    timezone: z.string().optional(),
  }).optional(),
});

// Basic Profile Schema (for basic info updates)
export const basicProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
});

// Complete Student Profile Schema
export const studentProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  contactInfo: contactInfoSchema.optional(),
  address: addressSchema.optional(),
  academicInfo: academicInfoSchema.optional(),
  professionalInfo: professionalInfoSchema.optional(),
  learningPreferences: learningPreferencesSchema.optional(),
  privacy: privacySchema.optional(),
});

// Learning Activity Schema
export const learningActivitySchema = z.object({
  enrollmentId: z.string().min(1, 'Enrollment ID is required'),
  moduleId: z.string().optional(),
  lessonId: z.string().optional(),
  timeSpent: z.number().min(0, 'Time spent must be positive').optional(),
});

// Photo Upload Schema
export const photoUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'File must be a JPEG, PNG, or WebP image'
    ),
});

// Form Types (for TypeScript)
export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
export type ContactInfoFormData = z.infer<typeof contactInfoSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
export type AcademicInfoFormData = z.infer<typeof academicInfoSchema>;
export type ProfessionalInfoFormData = z.infer<typeof professionalInfoSchema>;
export type LearningPreferencesFormData = z.infer<typeof learningPreferencesSchema>;
export type PrivacyFormData = z.infer<typeof privacySchema>;
export type BasicProfileFormData = z.infer<typeof basicProfileSchema>;
export type StudentProfileFormData = z.infer<typeof studentProfileSchema>;
export type LearningActivityFormData = z.infer<typeof learningActivitySchema>;
export type PhotoUploadFormData = z.infer<typeof photoUploadSchema>;

// Validation Helpers
export const validateStudentProfile = (data: unknown) => {
  return studentProfileSchema.safeParse(data);
};

export const validatePhotoUpload = (file: File) => {
  return photoUploadSchema.safeParse({ file });
};

export const validateLearningActivity = (data: unknown) => {
  return learningActivitySchema.safeParse(data);
};
