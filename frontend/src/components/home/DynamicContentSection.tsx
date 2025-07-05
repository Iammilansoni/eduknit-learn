
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";

const DynamicContentSection = () => {
  return (
    <section className="section-padding bg-blue-200 dark:bg-gray-900">
      <div className="edu-container">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Learn Through Dynamic Content</h2>
        
        {/* Interactive Video Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-4">Featured Videos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="aspect-video rounded-lg overflow-hidden mb-4">
                  <iframe 
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <h4 className="font-semibold">Introduction to Web Development</h4>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow md:block hidden">
              <CardContent className="p-4">
                <div className="aspect-video rounded-lg overflow-hidden mb-4">
                  <iframe 
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <h4 className="font-semibold">Advanced JavaScript Concepts</h4>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow lg:block hidden">
              <CardContent className="p-4">
                <div className="aspect-video rounded-lg overflow-hidden mb-4">
                  <iframe 
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <h4 className="font-semibold">React.js for Beginners</h4>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Image Carousel
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-4">Our Campus Life</h3>
          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent>
              {[
                "photo-1488590528505-98d2b5aba04b",
                "photo-1486312338219-ce68d2c6f44d",
                "photo-1581091226825-a6a2a5aee158"
              ].map((id, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-video items-center justify-center p-6">
                        <img
                          src={`https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`}
                          alt={`Campus life ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div> */}

        {/* Interactive Boxes */}
        <div>
          <h3 className="text-2xl font-semibold mb-4">Learning Resources</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "E-Books", count: "1000+" },
              { title: "Video Tutorials", count: "500+" },
              { title: "Practice Tests", count: "200+" },
              { title: "Live Sessions", count: "50+" }
            ].map((resource, index) => (
              <Card 
                key={index} 
                className="hover:bg-[#f57920] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <CardContent className="p-6 text-center">
                  <h4 className="font-bold text-xl mb-2">{resource.title}</h4>
                  <p className="text-3xl font-bold text-eduBlue-500">{resource.count}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DynamicContentSection;
