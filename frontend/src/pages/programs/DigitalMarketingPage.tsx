
import React from 'react';
import ProgramPageTemplate1 from '@/components/programs/ProgramPageTemplate1';
import { Megaphone } from 'lucide-react';

const DigitalMarketingPage = () => {
  return (
    <ProgramPageTemplate1
      icon={<Megaphone className="h-8 w-8" />}
      iconBgClass="bg-eduOrange-100"
      iconTextClass="text-eduOrange-600"
      title="Digital Marketing"
      tagline="Learn how businesses grow in the real world — and how you can, too."
      videoSrc="https://player.vimeo.com/external/452294550.hd.mp4?s=389a803bb3dcc9e4d31e6cfd7ea509a9275f61ac"
      overview={[
        "The Digital Marketing program equips you with the skills to navigate and excel in today's complex online landscape. From social media strategy to data-driven campaigns, you'll gain practical experience that translates directly to real-world results.",
        "Our curriculum combines foundational marketing principles with cutting-edge digital tactics, preparing you to create compelling campaigns across platforms while measuring and optimizing their performance.",
        "Whether you're interested in pursuing a career in marketing or want to promote your own ideas and ventures, this program provides the toolkit you need to stand out in the digital space."
      ]}
      careerOutlook={{
        description: [
          "Digital marketing skills are in high demand across virtually every industry, with companies of all sizes investing heavily in online presence and campaigns.",
          "By developing a strong foundation in digital marketing now, you'll position yourself for numerous career paths, from specialized roles in social media or SEO to broader marketing leadership positions."
        ],
        paths: [
          {
            title: "Social Media Manager",
            description: "Create and implement effective social media strategies across platforms."
          },
          {
            title: "Digital Marketing Specialist",
            description: "Develop and execute comprehensive digital marketing campaigns."
          },
          {
            title: "Content Marketer",
            description: "Create compelling content that attracts and engages target audiences."
          },
          {
            title: "SEO & SEM Specialist",
            description: "Optimize online visibility through search engine optimization and marketing."
          }
        ]
      }}
      curriculum={{
        description: "Our digital marketing curriculum covers all essential aspects of the field, with hands-on projects that simulate real-world marketing challenges.",
        modules: [
          {
            id: "module-1",
            title: "Digital Marketing Fundamentals",
            description: "Understand the core concepts and landscape of digital marketing.",
            lessons: [
              {
                id: "lesson-1-1",
                title: "Introduction to Digital Marketing",
                duration: "25 min",
                type: "video"
              },
              {
                id: "lesson-1-2",
                title: "Customer Journey & Digital Touchpoints",
                duration: "30 min",
                type: "video"
              },
              {
                id: "lesson-1-3",
                title: "Digital Marketing Strategy Framework",
                duration: "20 min",
                type: "reading"
              }
            ]
          },
          {
            id: "module-2",
            title: "Social Media Marketing",
            description: "Master strategies for effective marketing across social platforms.",
            lessons: [
              {
                id: "lesson-2-1",
                title: "Platform Selection & Strategy",
                duration: "35 min",
                type: "video"
              },
              {
                id: "lesson-2-2",
                title: "Content Creation for Social Media",
                duration: "40 min",
                type: "video"
              },
              {
                id: "lesson-2-3",
                title: "Social Media Campaign Project",
                duration: "60 min",
                type: "quiz"
              }
            ]
          },
          {
            id: "module-3",
            title: "Content Marketing",
            description: "Learn to create and distribute valuable, relevant content.",
            lessons: [
              {
                id: "lesson-3-1",
                title: "Content Strategy Development",
                duration: "25 min",
                type: "video"
              },
              {
                id: "lesson-3-2",
                title: "Blogging & Article Writing",
                duration: "30 min",
                type: "video"
              },
              {
                id: "lesson-3-3",
                title: "Content Distribution Channels",
                duration: "20 min",
                type: "reading"
              }
            ]
          },
          {
            id: "module-4",
            title: "Performance Marketing",
            description: "Develop data-driven campaigns that deliver measurable results.",
            lessons: [
              {
                id: "lesson-4-1",
                title: "Introduction to Paid Advertising",
                duration: "30 min",
                type: "video"
              },
              {
                id: "lesson-4-2",
                title: "Campaign Measurement & Analytics",
                duration: "35 min",
                type: "video"
              },
              {
                id: "lesson-4-3",
                title: "Performance Marketing Project",
                duration: "60 min",
                type: "quiz"
              }
            ]
          }
        ]
      }}
      support={{
        description: [
          "Success in our Digital Marketing program comes with comprehensive support throughout your learning journey.",
          "We provide the tools, resources, and guidance you need to apply your skills effectively and build an impressive digital marketing portfolio."
        ],
        features: [
          {
            title: "Marketing Tools Access",
            description: "Get hands-on experience with industry-standard marketing tools and platforms."
          },
          {
            title: "Campaign Reviews",
            description: "Receive expert feedback on your marketing campaigns and strategies."
          },
          {
            title: "Industry Case Studies",
            description: "Learn from real-world marketing successes and challenges across industries."
          },
          {
            title: "Digital Marketing Community",
            description: "Connect with fellow students and professionals to share insights and opportunities."
          }
        ]
      }}
      faqs={[
        {
          question: "Is this program suitable for complete beginners?",
          answer: "Absolutely! The program starts with fundamentals and progressively builds more advanced skills, making it perfect for beginners while still valuable for those with some marketing experience."
        },
        {
          question: "Will I create actual marketing campaigns during the program?",
          answer: "Yes, you'll work on practical projects throughout the program, including creating and implementing real digital marketing campaigns."
        },
        {
          question: "Do I need any special software or tools?",
          answer: "All necessary tools are provided as part of the program, and we focus on widely available platforms so you can apply your skills immediately."
        },
        {
          question: "How up-to-date is the curriculum with current digital marketing trends?",
          answer: "Our curriculum is regularly updated to reflect the latest digital marketing trends, platform changes, and best practices in the industry."
        },
        {
          question: "Can I use the projects I create in my portfolio?",
          answer: "Absolutely! We encourage you to use your project work to build a portfolio that showcases your digital marketing skills to potential employers or clients."
        }
      ]}
    />
  );
};

export default DigitalMarketingPage;
