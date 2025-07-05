
import React from 'react';
import Layout from '@/components/layout/Layout';
import FeaturesSection from '@/components/home/FeaturesSection';

const FeaturesPage = () => {
  return (
    <Layout>
      <div className="pt-10">
        <FeaturesSection />
      </div>
    </Layout>
  );
};

export default FeaturesPage;
