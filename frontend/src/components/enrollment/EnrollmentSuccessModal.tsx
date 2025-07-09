import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, BookOpen, ArrowRight } from 'lucide-react';

interface EnrollmentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  courseSlug: string; // URL slug for the program (e.g., "communication-skills")
}

const EnrollmentSuccessModal: React.FC<EnrollmentSuccessModalProps> = ({
  isOpen,
  onClose,
  courseTitle,
  courseSlug
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
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                  </motion.div>

                  {/* Success Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      🎉 Enrollment Successful!
                    </h3>
                    <p className="text-lg text-gray-600 mb-8">
                      You've successfully enrolled in{' '}
                      <span className="font-semibold text-eduBlue-600">
                        "{courseTitle}"
                      </span>
                      !
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
                      className="w-full bg-eduBlue-600 hover:bg-eduBlue-700 text-white py-3 text-base font-medium"
                      size="lg"
                    >
                      <BookOpen className="h-5 w-5 mr-2" />
                      Start Learning
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    
                    <Button
                      onClick={handleGoToDashboard}
                      variant="outline"
                      className="w-full border-eduBlue-200 text-eduBlue-600 hover:bg-eduBlue-50 py-3 text-base"
                      size="lg"
                    >
                      Go to Dashboard
                    </Button>
                  </motion.div>

                  {/* Additional Info */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.3 }}
                    className="mt-6 p-4 bg-blue-50 rounded-lg"
                  >
                    <p className="text-sm text-blue-800">
                      💡 <strong>Pro Tip:</strong> Access your course anytime from your dashboard or continue from where you left off.
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
