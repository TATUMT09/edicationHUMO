import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

const Subjects = lazy(() => import('@/pages/Portal/Subjects'));
const Levels = lazy(() => import('@/pages/Portal/Levels'));
const ContentList = lazy(() => import('@/pages/Portal/ContentList'));
const VideoPlayer = lazy(() => import('@/pages/Portal/VideoPlayer'));
const BookViewer = lazy(() => import('@/pages/Portal/BookViewer'));
const TestTake = lazy(() => import('@/pages/Portal/TestTake'));
const AttemptDetail = lazy(() => import('@/pages/Portal/AttemptDetail'));
const History = lazy(() => import('@/pages/Portal/History'));
const Stats = lazy(() => import('@/pages/Portal/Stats'));
const Leaderboard = lazy(() => import('@/pages/Portal/Leaderboard'));
const StarHistory = lazy(() => import('@/pages/Portal/StarHistory'));
const RewardStore = lazy(() => import('@/pages/Portal/RewardStore'));
const MyRewardOrders = lazy(() => import('@/pages/Portal/MyRewardOrders'));

export default function PortalRouter() {
  return (
    <Routes>
      <Route path="/" element={<Subjects />} />
      <Route path="/portal" element={<Subjects />} />
      <Route path="/portal/subjects/:subjectId" element={<Levels />} />
      <Route path="/portal/subjects/:subjectId/:level" element={<ContentList />} />
      <Route path="/portal/video/:videoId" element={<VideoPlayer />} />
      <Route path="/portal/books/:bookId" element={<BookViewer />} />
      <Route path="/portal/tests/:testId" element={<TestTake />} />
      <Route path="/portal/attempts/:attemptId" element={<AttemptDetail />} />
      <Route path="/portal/history" element={<History />} />
      <Route path="/portal/stats" element={<Stats />} />
      <Route path="/portal/leaderboard" element={<Leaderboard />} />
      <Route path="/portal/stars" element={<StarHistory />} />
      <Route path="/portal/rewards" element={<RewardStore />} />
      <Route path="/portal/reward-orders" element={<MyRewardOrders />} />
    </Routes>
  );
}
