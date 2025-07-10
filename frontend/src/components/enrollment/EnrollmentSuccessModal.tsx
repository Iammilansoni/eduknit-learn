import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, BookOpen, ArrowRight, UserCheck } from 'lucide-react';

interface EnrollmentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  courseSlug: string; // URL slug for the program (e.g., "communication-skills")
  isAlreadyEnrolled?: boolean; // New prop to determine if user is already enrolled
}

const EnrollmentSuccessModal: React.FC<EnrollmentSuccessModalProps> = ({
  isOpen,
  onClose,
  courseTitle,
  courseSlug,
  isAlreadyEnrolled = false
}) => {
  const navigate = useNavigate();

  const handleStartLearning = () => {
    onClose();
    // Navigate to the program page with curriculum tab pre-selected
    navigate(`/programs/${courseSlug}#curriculum`, { 
      state: { activeTab: 'curriculum' } 
    });
  };

  const handleGoToDashboard = () => {
    onClose();
    navigate('/student-dashboard');
  };

  // Different content based on enrollment status
  const modalContent = isAlreadyEnrolled ? {
    icon: <UserCheck className="h-12 w-12 text-blue-600" />,
    iconBg: "bg-blue-100",
    title: "Already Enrolled!",
    message: `You're already enrolled in "${courseTitle}". Continue your learning journey!`,
    primaryButtonText: "Continue Learning",
    secondaryButtonText: "Go to Dashboard",
    tipMessage: "💡 You can access your course progress and continue from where you left off in your dashboard.",
    tipBg: "bg-blue-50"
  } : {
    icon: <CheckCircle className="h-12 w-12 text-green-600" />,
    iconBg: "bg-green-100",
    title: "🎉 Enrollment Successful!",
    message: `You've successfully enrolled in "${courseTitle}"!`,
    primaryButtonText: "Start Learning",
    secondaryButtonText: "Go to Dashboard",
    tipMessage: "💡 Pro Tip: Access your course anytime from your dashboard or continue from where you left off.",
    tipBg: "bg-green-50"
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Card className="border-0 shadow-2xl">
                <CardContent className="p-8 text-center">
                  {/* Success Icon with Animation */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
                    className="mb-6"
                  >
                    <div className={`w-20 h-20 ${modalContent.iconBg} rounded-full flex items-center justify-center mx-auto`}>
                      {modalContent.icon}
                    </div>
                  </motion.div>

                  {/* Success Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    <h3 className={`text-2xl font-bold text-gray-900 mb-3 ${isAlreadyEnrolled ? 'text-blue-900' : 'text-green-900'}`}>
                      {modalContent.title}
                    </h3>
                    <p className="text-lg text-gray-600 mb-8">
                      {modalContent.message}
                    </p>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.3 }}
                    className="space-y-3"
                  >
                    <Button
                      onClick={handleStartLearning}
                      className={`w-full ${isAlreadyEnrolled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-eduBlue-600 hover:bg-eduBlue-700'} text-white py-3 text-base font-medium`}
                      size="lg"
                    >
                      <BookOpen className="h-5 w-5 mr-2" />
                      {modalContent.primaryButtonText}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    
                    <Button
                      onClick={handleGoToDashboard}
                      variant="outline"
                      className={`w-full ${isAlreadyEnrolled ? 'border-blue-200 text-blue-600 hover:bg-blue-50' : 'border-eduBlue-200 text-eduBlue-600 hover:bg-eduBlue-50'} py-3 text-base`}
                      size="lg"
                    >
                      {modalContent.secondaryButtonText}
                    </Button>
                  </motion.div>

                  {/* Additional Info */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.3 }}
                    className={`mt-6 p-4 ${modalContent.tipBg} rounded-lg`}
                  >
                    <p className={`text-sm ${isAlreadyEnrolled ? 'text-blue-800' : 'text-green-800'}`}>
                      {modalContent.tipMessage}
                    </p>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default EnrollmentSuccessModal;
