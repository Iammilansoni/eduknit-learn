
import React from 'react';
import Layout from '@/components/layout/Layout';
import TestimonialsSection from '@/components/home/TestimonialsSection';

const TestimonialsPage = () => {
  return (
    <Layout>
      <div className="pt-10">
        <TestimonialsSection />
      </div>
    </Layout>
  );
};

export default TestimonialsPage;
