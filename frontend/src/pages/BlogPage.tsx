
import React from 'react';
import Layout from '@/components/layout/Layout';
import BlogHero from '@/components/blog/BlogHero';
import FeaturedPosts from '@/components/blog/FeaturedPosts';
import RecentPosts from '@/components/blog/RecentPosts';
import CategorySection from '@/components/blog/CategorySection';

const BlogPage = () => {
  return (
    <Layout>
      <BlogHero />
      <FeaturedPosts />
      <RecentPosts />
      <CategorySection />
    </Layout>
  );
};

export default BlogPage;
