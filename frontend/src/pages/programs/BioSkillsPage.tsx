
import React from 'react';
import ProgramPageTemplate5 from '@/components/programs/ProgramPageTemplate5';
import { FlaskConical } from 'lucide-react';

const BioSkillsPage = () => {
  return (
    <ProgramPageTemplate5
      icon={<FlaskConical className="h-8 w-8" />}
      iconBgClass="bg-eduOrange-100"
      iconTextClass="text-eduOrange-600"
      title="BioSkills"
      tagline="Get beyond textbooks. Build industry-relevant biology skills."
      videoSrc="https://player.vimeo.com/external/372449679.hd.mp4?s=ddd377f7e5840dfa43eed44c7104b50f05a9d218"
      overview={[
        "The BioSkills program bridges the gap between academic biology knowledge and practical, industry-relevant applications. Instead of focusing solely on memorization, we emphasize applied skills that prepare you for real-world roles.",
        "Through case studies, problem-solving exercises, and virtual lab experiences, you'll develop a holistic understanding of modern biological sciences and their applications across healthcare, research, and biotechnology.",
        "Whether you're planning to pursue medicine, research, or biotechnology careers, this program will enrich your biological understanding with practical skills valued by employers and advanced educational programs."
      ]}
      careerOutlook={{
        description: [
          "Biological sciences offer diverse and growing career opportunities, with particularly strong growth in biotechnology, healthcare, and environmental fields.",
          "By developing applied bioscience skills now, you'll be better positioned for competitive programs and emerging career paths that require both theoretical knowledge and practical abilities."
        ],
        paths: [
          {
            title: "Healthcare Professional",
            description: "Apply biological knowledge in medical, nursing, or allied health fields."
          },
          {
            title: "Research Scientist",
            description: "Conduct investigations in academic, government, or industry settings."
          },
          {
            title: "Biotechnology Specialist",
            description: "Work with cutting-edge biological technologies and applications."
          },
          {
            title: "Environmental Scientist",
            description: "Apply biological principles to environmental protection and management."
          }
        ]
      }}
      curriculum={{
        description: "Our curriculum emphasizes practical applications and critical thinking rather than mere memorization of facts.",
        modules: [
          {
            id: "module-1",
            title: "Applied Cellular Biology",
            description: "Understand cellular processes through practical applications.",
            lessons: [
              {
                id: "lesson-1-1",
                title: "Cellular Structure & Function in Practice",
                duration: "30 min",
                type: "video"
              },
              {
                id: "lesson-1-2",
                title: "Cell Communication Case Studies",
                duration: "25 min",
                type: "video"
              },
              {
                id: "lesson-1-3",
                title: "Virtual Cell Imaging Lab",
                duration: "45 min",
                type: "video"
              }
            ]
          },
          {
            id: "module-2",
            title: "Practical Genetics & Genomics",
            description: "Explore the applications of genetic knowledge in modern biosciences.",
            lessons: [
              {
                id: "lesson-2-1",
                title: "Genetic Technologies in Practice",
                duration: "35 min",
                type: "video"
              },
              {
                id: "lesson-2-2",
                title: "Genomics Data Interpretation",
                duration: "40 min",
                type: "video"
              },
              {
                id: "lesson-2-3",
                title: "Genetic Testing Case Analysis",
                duration: "30 min",
                type: "reading"
              }
            ]
          },
          {
            id: "module-3",
            title: "Biotechnology Applications",
            description: "Discover how biological knowledge is applied in industry.",
            lessons: [
              {
                id: "lesson-3-1",
                title: "Pharmaceutical Development Process",
                duration: "30 min",
                type: "video"
              },
              {
                id: "lesson-3-2",
                title: "Agricultural Biotechnology",
                duration: "25 min",
                type: "video"
              },
              {
                id: "lesson-3-3",
                title: "Biomanufacturing Technologies",
                duration: "30 min",
                type: "reading"
              }
            ]
          },
          {
            id: "module-4",
            title: "Biological Research Skills",
            description: "Develop fundamental skills for biological investigation.",
            lessons: [
              {
                id: "lesson-4-1",
                title: "Experimental Design",
                duration: "35 min",
                type: "video"
              },
              {
                id: "lesson-4-2",
                title: "Scientific Literature Analysis",
                duration: "30 min",
                type: "video"
              },
              {
                id: "lesson-4-3",
                title: "Research Project Simulation",
                duration: "60 min",
                type: "quiz"
              }
            ]
          }
        ]
      }}
      support={{
        description: [
          "Our BioSkills program provides comprehensive support to help you apply biological concepts in practical contexts.",
          "From virtual laboratory experiences to case-based learning, you'll have resources that make biological sciences tangible and applicable."
        ],
        features: [
          {
            title: "Virtual Labs",
            description: "Experience laboratory techniques and experiments through interactive simulations."
          },
          {
            title: "Case Studies",
            description: "Apply biological knowledge to real-world scenarios and problems."
          },
          {
            title: "Scientific Paper Access",
            description: "Access and learn to interpret current research in biological sciences."
          },
          {
            title: "Industry Connections",
            description: "Learn from professionals working in various biological science fields."
          }
        ]
      }}
      faqs={[
        {
          question: "How is this program different from a standard biology course?",
          answer: "While traditional courses often focus heavily on theory and memorization, our program emphasizes practical applications, problem-solving skills, and the development of abilities valued in real-world biological science contexts."
        },
        {
          question: "Do I need a strong biology background to benefit from this program?",
          answer: "A basic understanding of biology fundamentals is helpful, but our program is designed to be accessible to students with varying levels of prior knowledge. We provide additional resources to help bridge any gaps."
        },
        {
          question: "Will this program help me prepare for pre-med or other health profession programs?",
          answer: "Absolutely. The applied skills and case-based learning in this program will complement traditional coursework and help develop the critical thinking and problem-solving abilities valued in medical and health profession programs."
        },
        {
          question: "Are there any hands-on components, or is it all virtual?",
          answer: "While the program is primarily delivered through our online platform, it includes virtual lab simulations, at-home activities that can be done with simple materials, and optional guidance for more advanced experiments if you have access to school lab facilities."
        },
        {
          question: "How current is the content with respect to advances in biological sciences?",
          answer: "Our curriculum is regularly updated to incorporate recent advances in biological sciences. We place special emphasis on emerging fields and technologies that are shaping the future of biology-related careers."
        }
      ]}
    />
  );
};

export default BioSkillsPage;
