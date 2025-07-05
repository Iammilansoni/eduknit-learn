
import React from 'react';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import OverviewSection from '@/components/home/OverviewSection';

const OverviewPage = () => {
  return (
    <Layout>
      <HeroSection />
      <OverviewSection />
    </Layout>
  );
};

export default OverviewPage;
