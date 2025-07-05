
import React from 'react';
import Layout from '@/components/layout/Layout';
import SectionHeader from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Users, Target, GraduationCap, BriefcaseBusiness } from 'lucide-react';

const AboutPage = () => {
  const team = [
    {
      name: 'Deepak Kumar',
      role: 'Founder & CEO',
      bio: 'With over 15 years of experience in education technology, Deepak founded EduKnit with a vision to make quality education accessible to all.',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cHJvZmVzc2lvbmFsJTIwbWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    },
    {
      name: 'Anjali Sharma',
      role: 'Chief Academic Officer',
      bio: 'Anjali brings her expertise from Stanford University to oversee curriculum development and ensure educational excellence across all programs.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    },
    {
      name: 'Rahul Verma',
      role: 'Technology Director',
      bio: 'Previously at Google, Rahul leads our technology team in creating an innovative platform that enhances the learning experience for all students.',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHByb2Zlc3Npb25hbCUyMG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
    },
    {
      name: 'Neha Patel',
      role: 'Student Success Manager',
      bio: 'With a background in educational psychology, Neha ensures that every student receives the support they need to succeed in their learning journey.',
      image: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHByb2Zlc3Npb25hbCUyMHdvbWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-eduBlue-500 to-eduBlue-700 text-white">
        <div className="edu-container py-16 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About EduKnit</h1>
            <p className="text-xl opacity-90 mb-6">
              Empowering learners worldwide with cutting-edge educational resources and a supportive community
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding">
        <div className="edu-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="heading-2 mb-6">Our Mission & Vision</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                At EduKnit, our mission is to transform lives through accessible, high-quality education that meets the demands of today's rapidly evolving world. We believe that education should be engaging, practical, and designed to help learners achieve their goals.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Our vision is to become the leading global platform where individuals can develop the skills they need to thrive in their careers and contribute meaningfully to society. We strive to create an inclusive learning environment that celebrates diversity and fosters innovation.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                <div className="flex items-start">
                  <div className="mr-4 p-2 bg-eduBlue-100 dark:bg-eduBlue-900 rounded-lg">
                    <Target className="h-6 w-6 text-eduBlue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-2">Our Purpose</h3>
                    <p className="text-gray-600 dark:text-gray-300">To make quality education accessible to everyone, everywhere.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="mr-4 p-2 bg-eduOrange-100 dark:bg-eduOrange-900 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-eduOrange-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-2">Our Approach</h3>
                    <p className="text-gray-600 dark:text-gray-300">Practical learning focused on real-world skills and applications.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHRlYW0lMjBjb2xsYWJvcmF0aW9ufGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=80" 
                alt="Team collaboration" 
                className="rounded-xl shadow-lg w-full"
              />
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-eduOrange-500 rounded-lg opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="section-padding bg-gray-50 dark:bg-gray-900">
        <div className="edu-container">
          <SectionHeader 
            title="Meet Our Team" 
            subtitle="The passionate professionals behind EduKnit's success"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-64 object-cover object-center"
                />
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                  <p className="text-eduBlue-600 dark:text-eduBlue-400 text-sm mb-3">{member.role}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Journey */}
      <section className="section-padding">
        <div className="edu-container">
          <SectionHeader 
            title="Our Journey" 
            subtitle="From humble beginnings to impacting thousands of learners worldwide"
            alignment="left"
          />
          
          <div className="space-y-12 relative before:content-[''] before:absolute before:left-6 before:top-0 before:h-full before:w-0.5 before:bg-eduBlue-100 dark:before:bg-gray-700 pl-16">
            <div className="relative">
              <div className="absolute -left-16 top-0 bg-eduBlue-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold">
                2018
              </div>
              <h3 className="text-xl font-bold mb-2">The Beginning</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                EduKnit was founded with a simple idea: create practical courses that teach real-world skills. Starting with just 3 courses in web development.
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute -left-16 top-0 bg-eduBlue-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold">
                2020
              </div>
              <h3 className="text-xl font-bold mb-2">Expanding Horizons</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Our catalog grew to 25 courses spanning technology, business, and soft skills. We reached our first 10,000 students milestone.
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute -left-16 top-0 bg-eduBlue-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold">
                2022
              </div>
              <h3 className="text-xl font-bold mb-2">Community Building</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Launched our community platform, mentorship program, and discussion forums to enhance the learning experience.
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute -left-16 top-0 bg-eduBlue-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold">
                2023
              </div>
              <h3 className="text-xl font-bold mb-2">Global Impact</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Reached 50,000+ students across 120+ countries. Established partnerships with leading industry experts and companies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Career Opportunities */}
      <section className="section-padding bg-eduBlue-600 dark:bg-eduBlue-800 text-white">
        <div className="edu-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Our Team</h2>
            <p className="text-xl text-white/90 mb-8">
              We're always looking for passionate educators, technologists, and creative minds to help us shape the future of education.
            </p>
            <div className="flex justify-center">
              <Button size="lg" className="bg-white text-eduBlue-600 hover:bg-gray-100 hover:text-eduBlue-700" asChild>
                <Link to="/careers">View Career Opportunities</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
