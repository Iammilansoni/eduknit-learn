import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Book, Users, Award } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination, Autoplay } from 'swiper/modules';

const HeroSection = () => {
  const slidesData = [
    {
      heading: 'Transform Your Future with',
      subHeading: 'Unlock your potential with our expert-led courses designed to build real-world skills that employers demand.',
      image: 'https://www.unesco.org/sites/default/files/styles/paragraph_medium_desktop/public/2022-11/Social%20inclusion.jpg?itok=LrIyAgH5',
      cardTitle: 'Learn from Industry Experts',
      cardText: 'Get personalized guidance from professionals who’ve excelled in their fields.',
    },
    {
      heading: 'Build In-Demand Skills with',
      subHeading: 'Stay ahead with programs designed to match the evolving tech landscape.',
      image: 'https://images.unsplash.com/photo-1584697964154-6f4f6e5df7b1',
      cardTitle: 'Hands-on Projects',
      cardText: 'Practice real-world scenarios that simulate job-ready tasks.',
    },
    {
      heading: 'Achieve Career Growth via',
      subHeading: 'Gain confidence and clarity in your learning journey with structured guidance.',
      image: 'https://images.unsplash.com/photo-1612831662237-4b6dedfbf4fd',
      cardTitle: 'Career Mentorship',
      cardText: 'Our mentors are here to support your personal and professional growth.',
    },
  ];

  return (
    <section className="bg-gradient-to-r from-eduBlue-500 to-eduBlue-700 text-white">
      <Swiper
        spaceBetween={30}
        slidesPerView={1}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        modules={[Pagination, Autoplay]}
        className="rounded-none"
      >
        {slidesData.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="edu-container section-padding">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
                {/* Text Section */}
                <div className="animate-fade-in order-2 lg:order-1">
                  <h1 className="heading-1 mb-4 sm:mb-6">
                    {slide.heading} <span className="text-eduOrange-400">EduKnit</span>
                  </h1>
                  <p className="text-base sm:text-lg lg:text-xl opacity-90 mb-6 sm:mb-8 max-w-lg">{slide.subHeading}</p>

                  <div className="flex flex-col sm:flex-row gap-4 mb-8 sm:mb-12">
                    <Button size="lg" className="edu-button-secondary w-full sm:w-auto" asChild>
                      <Link to="/programs" className="flex items-center justify-center">
                        Explore Programs <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 border-white text-white w-full sm:w-auto" asChild>
                      <Link to="/about">Learn More</Link>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-2 md:gap-4">
                    <div className="flex flex-col items-center bg-white/10 rounded-lg p-3 sm:p-4">
                      <Book className="h-6 w-6 sm:h-8 sm:w-8 text-eduOrange-400 mb-2" />
                      <span className="font-bold text-lg sm:text-2xl">100+</span>
                      <span className="text-xs sm:text-sm text-center">Expert Courses</span>
                    </div>
                    <div className="flex flex-col items-center bg-white/10 rounded-lg p-3 sm:p-4">
                      <Users className="h-6 w-6 sm:h-8 sm:w-8 text-eduOrange-400 mb-2" />
                      <span className="font-bold text-lg sm:text-2xl">50K+</span>
                      <span className="text-xs sm:text-sm text-center">Active Students</span>
                    </div>
                    <div className="flex flex-col items-center bg-white/10 rounded-lg p-3 sm:p-4">
                      <Award className="h-6 w-6 sm:h-8 sm:w-8 text-eduOrange-400 mb-2" />
                      <span className="font-bold text-lg sm:text-2xl">98%</span>
                      <span className="text-xs sm:text-sm text-center">Success Rate</span>
                    </div>
                  </div>
                </div>

                {/* Image Card */}
                <div className="order-1 lg:order-2 px-2 sm:px-4 py-6 sm:py-8 md:py-12 relative overflow-hidden">
                  <div className="relative z-10 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-4xl mx-auto bg-white border-2 sm:border-4 border-eduOrange-400 rounded-xl sm:rounded-2xl md:rounded-[2rem] overflow-hidden shadow-xl sm:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:shadow-orange-200 group">
                    <img
                      src={slide.image}
                      alt="Hero Visual"
                      className="w-full h-[180px] sm:h-[200px] md:h-[220px] lg:h-[250px] object-cover object-center rounded-t-xl sm:rounded-t-2xl md:rounded-t-[2rem]"
                    />
                    <div className="p-4 sm:p-6 md:p-8 bg-white/90 backdrop-blur-sm transition-all duration-500 group-hover:bg-white">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2">{slide.cardTitle}</h3>
                      <p className="text-gray-600 text-sm sm:text-base">{slide.cardText}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default HeroSection;
