
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Search, MessageCircle, CreditCard, Bug, HelpCircle, ChevronDown, Phone, Mail, User } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const SupportFeatureCard = ({ 
  title, 
  description, 
  features, 
  icon: Icon 
}: { 
  title: string; 
  description: string; 
  features: string[];
  icon: React.ElementType;
}) => (
  <Card className="h-full transition-all duration-300 hover:shadow-lg border-t-4 border-t-eduBlue-500">
    <CardHeader className="pb-2">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-3 rounded-full bg-eduBlue-100 dark:bg-eduBlue-900 text-eduBlue-600 dark:text-eduBlue-300">
          <Icon size={24} />
        </div>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
      </div>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </CardHeader>
    <CardContent>
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <span className="text-green-500 mr-2">✅</span>
            <span className="text-gray-700 dark:text-gray-200">{feature}</span>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

// FAQ data
const faqData = [
  {
    question: "How do I book a 1-on-1 mentorship call?",
    answer: "You can book a 1-on-1 mentorship call by logging into your account, navigating to the 'Support' tab, and clicking on 'Book a Call'. Select your preferred time slot and mentor, and confirm your booking."
  },
  {
    question: "How do I join the Discord community?",
    answer: "After enrolling in any course, you'll receive an exclusive invitation link to join our Discord community. If you haven't received the link, please contact our support team for assistance."
  },
  {
    question: "What are the live chat support hours?",
    answer: "Our live chat support is available Monday through Saturday, from 10 AM to 7 PM. During these hours, you can click on the chat icon in the bottom right corner of any page to connect with our support team."
  },
  {
    question: "Is the AI chatbot available 24/7?",
    answer: "Yes, our AI chatbot is available 24/7 to assist you with any questions or issues you might have. You can access it by clicking on the chat icon in the bottom right corner of any page."
  },
  {
    question: "How quickly will I receive a response to my support ticket?",
    answer: "We aim to respond to all support tickets within 24 hours. However, during peak times, it might take up to 48 hours. For urgent matters, we recommend using the live chat support during business hours."
  },
  {
    question: "How can I provide feedback about the support I received?",
    answer: "After every support interaction, you'll receive an email with a link to provide feedback. Alternatively, you can navigate to the 'Support' section of your account and click on 'Provide Feedback'."
  }
];

// Help topic data
const helpTopics = [
  { 
    title: 'Account & Profile', 
    icon: User, 
    description: 'Manage your account settings, update profile information, and handle login issues.'
  },
  { 
    title: 'Payments & Billing', 
    icon: CreditCard, 
    description: 'View billing history, update payment methods, and resolve payment issues.'
  },
  { 
    title: 'Technical Support', 
    icon: Bug, 
    description: 'Troubleshoot technical issues, resolve platform bugs, and get help with device compatibility.'
  },
  { 
    title: 'Course Access', 
    icon: HelpCircle, 
    description: 'Get help accessing courses, downloading materials, and navigating the learning platform.'
  }
];

const SupportPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({ name, email, message });
    // Reset form
    setName('');
    setEmail('');
    setMessage('');
    // Show success message
    alert('Your message has been sent. We will get back to you shortly.');
  };

  return (
    <Layout>
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm py-2">
        <div className="edu-container">
          <div className="flex justify-center">
            <ul className="flex space-x-8">
              <li><a href="#features" className="text-eduBlue-600 hover:text-eduOrange-500 font-medium">Features</a></li>
              <li><a href="#topics" className="text-eduBlue-600 hover:text-eduOrange-500 font-medium">Topics</a></li>
              <li><a href="#faq" className="text-eduBlue-600 hover:text-eduOrange-500 font-medium">FAQ</a></li>
              <li><a href="#contact" className="text-eduBlue-600 hover:text-eduOrange-500 font-medium">Contact</a></li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="edu-container section-padding">
        {/* Hero Section */}
        <div className="text-center mb-12" id="hero">
          <SectionHeader
            title="Support That Powers Your Success — Every Single Day"
            subtitle="At EduKnit, we don't just give you content and say 'figure it out.' We walk with you. Talk with you. Support you — like no other platform does."
          />
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
            Whether you're feeling stuck, need advice, or just want someone to listen — we're right here, ready to help you move forward. Always.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mt-8 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input 
                type="text" 
                placeholder="Search for help topics..." 
                className="pl-10 pr-4 py-6 rounded-full border-2 focus:border-eduBlue-500"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </div>

        {/* Support Features Grid */}
        <div id="features" className="scroll-mt-20">
          <h2 className="text-2xl font-bold text-center mb-10">Our Support Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <SupportFeatureCard
              title="1-on-1 Mentorship Calls — Real Talk, Real Results"
              description="You'll never be 'just another student' here. With personal Google Meet sessions, you get a real mentor who listens, solves, guides, and inspires — one call at a time."
              features={[
                "Book support calls easily",
                "Academic, mindset & career clarity",
                "Zero judgment, 100% commitment"
              ]}
              icon={MessageCircle}
            />

            <SupportFeatureCard
              title="Exclusive Discord Community — You're Not Alone Anymore"
              description="Imagine a place where everyone's aiming higher — and helping each other get there. That's our Discord tribe."
              features={[
                "Daily doubt-solving",
                "Motivation from peers & mentors",
                "Live career talks, challenges & fun",
                "Surprise giveaways & growth sprints"
              ]}
              icon={MessageCircle}
            />

            <SupportFeatureCard
              title="Live Chat Support — Doubts Don't Wait, Neither Do We"
              description="Stuck with login? Course access? Confused about the next step? Our support team is lightning-fast, student-friendly, and always just a click away."
              features={[
                "Instant answers — no bots, just real people",
                "Available 10 AM – 7 PM (Mon–Sat)",
                "Super helpful, always respectful"
              ]}
              icon={MessageCircle}
            />

            <SupportFeatureCard
              title="24/7 AI Chatbot — Smart. Swift. Super Useful."
              description="Meet your round-the-clock learning buddy — our smart, in-built AI chatbot. It never sleeps and is always ready to help."
              features={[
                "Instant help for FAQs, courses & progress tracking",
                "Available 24/7 — even at 2 AM",
                "Always improving to serve you better"
              ]}
              icon={MessageCircle}
            />
          </div>
        </div>

        {/* Help Topics Section */}
        <div id="topics" className="mb-16 scroll-mt-20">
          <h2 className="text-2xl font-bold text-center mb-10">Help Topics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {helpTopics.map((topic, index) => (
              <Collapsible key={index} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 p-4">
                  <CollapsibleTrigger className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <div className="p-2 mr-3 bg-eduBlue-100 dark:bg-eduBlue-800 rounded-full">
                        <topic.icon size={20} className="text-eduBlue-600 dark:text-eduBlue-300" />
                      </div>
                      <h3 className="font-medium">{topic.title}</h3>
                    </div>
                    <ChevronDown size={20} className="transition-transform duration-200" />
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="p-4 bg-white dark:bg-gray-900">
                  <p className="text-gray-600 dark:text-gray-300">{topic.description}</p>
                  <a href="#contact" className="text-eduBlue-500 hover:text-eduBlue-700 mt-2 inline-block">
                    Get help with this topic →
                  </a>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div id="faq" className="mb-16 scroll-mt-20">
          <h2 className="text-2xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqData.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 dark:text-gray-300">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Contact Form */}
        <div id="contact" className="mb-16 scroll-mt-20">
          <h2 className="text-2xl font-bold text-center mb-10">Get in Touch</h2>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Have questions or need assistance? Our support team is here to help you. Fill out the form or use one of our contact methods below.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone size={20} className="mr-3 text-eduBlue-500" />
                  <span>+1 (555) 123-4567</span>
                </div>
                
                <div className="flex items-center">
                  <Mail size={20} className="mr-3 text-eduBlue-500" />
                  <span>support@eduknit.com</span>
                </div>
                
                <div className="flex items-center">
                  <MessageCircle size={20} className="mr-3 text-eduBlue-500" />
                  <span>Live Chat (10 AM - 7 PM, Mon-Sat)</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                    <Input 
                      id="name" 
                      type="text" 
                      placeholder="Your name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Your email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
                    <Textarea 
                      id="message" 
                      placeholder="How can we help you?" 
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>
                  
                  <button type="submit" className="w-full bg-eduBlue-500 hover:bg-eduBlue-600 text-white py-2 px-4 rounded-md transition-colors">
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="bg-gradient-to-r from-eduBlue-500 to-eduBlue-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-6">EduKnit Support = Your Secret Weapon</h2>
          <div className="flex flex-col md:flex-row justify-center gap-8 mb-8">
            <div className="flex items-center gap-2">
              <span className="text-green-300">✅</span>
              <span className="text-lg font-medium">You'll never feel lost</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-300">✅</span>
              <span className="text-lg font-medium">You'll always find help</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-300">✅</span>
              <span className="text-lg font-medium">You'll move forward — faster, smoother, stronger</span>
            </div>
          </div>
          <p className="text-lg mb-4">This isn't "support." This is your personal success engine — and it's built into everything we do.</p>
          <p className="text-lg font-medium">Because when you rise, we rise.</p>
          <p className="text-xl font-bold mt-6">Let's grow. Together.</p>
        </div>
      </div>
    </Layout>
  );
};

export default SupportPage;
