import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { cacheLife, cacheTag } from 'next/cache';
import clientPromise from '@/lib/mongodb';
import FloatingActions from './components/FloatingActions';
import Footer from './components/Footer';
import CTASection from './components/CTASection';

const HeroSection = dynamic(() => import('./components/HeroSection'));
const FoundationSection = dynamic(() => import('./components/FoundationSection'));
const ProductStorySection = dynamic(() => import('./components/ProductStorySection'));
const ReviewsSection = dynamic(() => import('./components/ReviewsSection'));

async function getPromotions() {
  'use cache';
  cacheLife('hours');
  cacheTag('promotions');
  const client = await clientPromise;
  const db = client.db('medtech');
  const products = await db.collection('products')
    .find({ isPromoted: true })
    .sort({ updatedAt: -1 })
    .project({ name: 1, photos: 1, promoDescription: 1, promoRating: 1 })
    .toArray();
  return products.map(p => ({
    _id: p._id.toString(),
    name: p.name,
    image: p.photos?.[0] || '',
    promoDescription: p.promoDescription || '',
    promoRating: p.promoRating || 5.0,
  }));
}

async function getReviews() {
  'use cache';
  cacheLife('hours');
  cacheTag('reviews');
  const client = await clientPromise;
  const db = client.db('medtech');
  const reviews = await db.collection('reviews')
    .find({ isSelectedForHome: true })
    .sort({ createdAt: -1 })
    .limit(10)
    .project({ name: 1, review: 1, type: 1, mediaUrl: 1, product: 1, createdAt: 1 })
    .toArray();
  return reviews.map(r => ({ ...r, _id: r._id.toString() }));
}

function HomeSkeleton() {
  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: '#FFE5D4' }} />
  );
}

export default async function Home() {
  const [promotions, reviews] = await Promise.all([getPromotions(), getReviews()]);

  return (
    <main style={{ margin: 0, padding: 0, width: '100%', fontFamily: 'Arial', overflowX: 'visible', backgroundColor: '#FFE5D4' }}>
      <FloatingActions />
      <Suspense fallback={<HomeSkeleton />}>
        <HeroSection promotions={promotions} />
      </Suspense>
      <Suspense fallback={<HomeSkeleton />}>
        <FoundationSection />
      </Suspense>
      <Suspense fallback={<HomeSkeleton />}>
        <ProductStorySection />
      </Suspense>
      <CTASection />
      <Suspense fallback={<HomeSkeleton />}>
        <ReviewsSection reviews={reviews} />
      </Suspense>
      <Footer />
    </main>
  );
}