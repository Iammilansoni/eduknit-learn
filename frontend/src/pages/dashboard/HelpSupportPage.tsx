import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  BookOpen,
  Video,
  FileText,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Clock,
  User,
  Send
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'GENERAL' | 'TECHNICAL' | 'COURSE' | 'PAYMENT' | 'ACCOUNT';
}

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  updatedAt: string;
  category: string;
}

const HelpSupportPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<Set<string>>(new Set());
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    category: 'GENERAL'
  });

  // Mock FAQ data
  const faqData: FAQItem[] = [
    {
      id: '1',
      question: 'How do I reset my password?',
      answer: 'You can reset your password by clicking the "Forgot Password" link on the login page. You\'ll receive an email with instructions to create a new password.',
      category: 'ACCOUNT'
    },
    {
      id: '2',
      question: 'How do I enroll in a course?',
      answer: 'To enroll in a course, navigate to the course page and click the "Enroll Now" button. You\'ll be redirected to complete the enrollment process.',
      category: 'COURSE'
    },
    {
      id: '3',
      question: 'Can I access course materials offline?',
      answer: 'Currently, course materials are only available online. However, you can download some resources like PDFs and documents for offline viewing.',
      category: 'TECHNICAL'
    },
    {
      id: '4',
      question: 'How do I track my progress?',
      answer: 'Your progress is automatically tracked as you complete lessons and quizzes. You can view your progress on the dashboard and analytics pages.',
      category: 'COURSE'
    },
    {
      id: '5',
      question: 'What payment methods do you accept?',
      answer: 'We accept major credit cards, PayPal, and bank transfers. All payments are processed securely through our payment partners.',
      category: 'PAYMENT'
    },
    {
      id: '6',
      question: 'How do I join live sessions?',
      answer: 'Live sessions can be joined through the Live Sessions page. Click the "Join Session" button to open the meeting in your browser or Zoom app.',
      category: 'TECHNICAL'
    },
    {
      id: '7',
      question: 'Can I get a refund?',
      answer: 'We offer a 30-day money-back guarantee for all courses. Contact our support team if you\'re not satisfied with your purchase.',
      category: 'PAYMENT'
    },
    {
      id: '8',
      question: 'How do I update my profile information?',
      answer: 'You can update your profile information by going to your profile page and clicking the "Edit Profile" button. Changes are saved automatically.',
      category: 'ACCOUNT'
    }
  ];

  // Mock support tickets
  const mockTickets: SupportTicket[] = [
    {
      id: '1',
      title: 'Cannot access course materials',
      description: 'I\'m having trouble accessing the video content for the JavaScript course.',
      status: 'RESOLVED',
      priority: 'HIGH',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'TECHNICAL'
    },
    {
      id: '2',
      title: 'Payment confirmation needed',
      description: 'I made a payment but haven\'t received confirmation yet.',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      category: 'PAYMENT'
    }
  ];

  // Filter FAQ based on search
  const filteredFAQ = faqData.filter(faq => {
    return faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
           faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
           faq.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const toggleFAQ = (faqId: string) => {
    const newExpanded = new Set(expandedFAQ);
    if (newExpanded.has(faqId)) {
      newExpanded.delete(faqId);
    } else {
      newExpanded.add(faqId);
    }
    setExpandedFAQ(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge className="bg-yellow-100 text-yellow-800">Open</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'RESOLVED':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'CLOSED':
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case 'MEDIUM':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'LOW':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmitContactForm = (e: React.FormEvent) => {
    e.preventDefault();
    // This would submit the form to the backend
    console.log('Submit contact form:', contactForm);
    setShowContactForm(false);
    setContactForm({ subject: '', message: '', category: 'GENERAL' });
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Help & Support</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Get help with your learning journey
            </p>
          </div>
          <Button onClick={() => setShowContactForm(true)}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 text-eduBlue-600" />
              <h3 className="text-lg font-semibold mb-2">FAQ</h3>
              <p className="text-gray-600 mb-4">Find answers to common questions</p>
              <Button variant="outline" onClick={() => document.getElementById('faq-section')?.scrollIntoView()}>
                Browse FAQ
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
              <p className="text-gray-600 mb-4">Chat with our support team</p>
              <Button variant="outline">
                Start Chat
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Mail className="h-12 w-12 mx-auto mb-4 text-purple-600" />
              <h3 className="text-lg font-semibold mb-2">Email Support</h3>
              <p className="text-gray-600 mb-4">Send us an email</p>
              <Button variant="outline" onClick={() => setShowContactForm(true)}>
                Send Email
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <Mail className="h-8 w-8 mx-auto mb-2 text-eduBlue-600" />
                <h4 className="font-semibold mb-1">Email Support</h4>
                <p className="text-sm text-gray-600">support@eduknit.com</p>
                <p className="text-xs text-gray-500">24/7 support</p>
              </div>
              <div className="text-center">
                <Phone className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h4 className="font-semibold mb-1">Phone Support</h4>
                <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                <p className="text-xs text-gray-500">Mon-Fri 9AM-6PM EST</p>
              </div>
              <div className="text-center">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h4 className="font-semibold mb-1">Live Chat</h4>
                <p className="text-sm text-gray-600">Available 24/7</p>
                <p className="text-xs text-gray-500">Instant response</p>
              </div>
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <h4 className="font-semibold mb-1">Response Time</h4>
                <p className="text-sm text-gray-600">Within 24 hours</p>
                <p className="text-xs text-gray-500">Usually faster</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div id="faq-section">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search FAQ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredFAQ.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">No FAQ found</h3>
                    <p className="text-gray-600">Try adjusting your search terms.</p>
                  </div>
                ) : (
                  filteredFAQ.map((faq) => (
                    <div key={faq.id} className="border rounded-lg">
                      <button
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
                        onClick={() => toggleFAQ(faq.id)}
                      >
                        <div>
                          <h4 className="font-medium">{faq.question}</h4>
                          <Badge variant="outline" className="mt-1">
                            {faq.category}
                          </Badge>
                        </div>
                        {expandedFAQ.has(faq.id) ? (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                      {expandedFAQ.has(faq.id) && (
                        <div className="px-4 pb-4">
                          <p className="text-gray-600">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              My Support Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mockTickets.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No support tickets</h3>
                <p className="text-gray-600">You haven\'t created any support tickets yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mockTickets.map((ticket) => (
                  <div key={ticket.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium">{ticket.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div>Created: {formatDate(ticket.createdAt)}</div>
                      <div>Updated: {formatDate(ticket.updatedAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Helpful Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border rounded-lg p-4">
                <Video className="h-8 w-8 mb-3 text-eduBlue-600" />
                <h4 className="font-semibold mb-2">Video Tutorials</h4>
                <p className="text-sm text-gray-600 mb-3">Learn how to use our platform with step-by-step video guides.</p>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Watch Videos
                </Button>
              </div>
              <div className="border rounded-lg p-4">
                <FileText className="h-8 w-8 mb-3 text-green-600" />
                <h4 className="font-semibold mb-2">User Guide</h4>
                <p className="text-sm text-gray-600 mb-3">Comprehensive guide to all platform features and functionality.</p>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Read Guide
                </Button>
              </div>
              <div className="border rounded-lg p-4">
                <HelpCircle className="h-8 w-8 mb-3 text-purple-600" />
                <h4 className="font-semibold mb-2">Community Forum</h4>
                <p className="text-sm text-gray-600 mb-3">Connect with other learners and get help from the community.</p>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Join Forum
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Form Modal */}
        {showContactForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Contact Support</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowContactForm(false)}
                >
                  ×
                </Button>
              </div>
              <form onSubmit={handleSubmitContactForm} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <Input
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={contactForm.category}
                    onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="GENERAL">General</option>
                    <option value="TECHNICAL">Technical</option>
                    <option value="COURSE">Course</option>
                    <option value="PAYMENT">Payment</option>
                    <option value="ACCOUNT">Account</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <Textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Describe your issue in detail..."
                    rows={4}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowContactForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HelpSupportPage; 