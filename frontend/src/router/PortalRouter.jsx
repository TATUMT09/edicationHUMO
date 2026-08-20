import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

const Subjects = lazy(() => import('@/pages/Portal/Subjects'));
const Levels = lazy(() => import('@/pages/Portal/Levels'));
const ContentList = lazy(() => import('@/pages/Portal/ContentList'));
const VideoPlayer = lazy(() => import('@/pages/Portal/VideoPlayer'));
const TestTake = lazy(() => import('@/pages/Portal/TestTake'));
const AttemptDetail = lazy(() => import('@/pages/Portal/AttemptDetail'));
const History = lazy(() => import('@/pages/Portal/History'));
const Stats = lazy(() => import('@/pages/Portal/Stats'));

export default function PortalRouter() {
  return (
    <Routes>
      <Route path="/portal" element={<Subjects />} />
      <Route path="/portal/subjects/:subjectId" element={<Levels />} />
      <Route path="/portal/subjects/:subjectId/:level" element={<ContentList />} />
      <Route path="/portal/video/:videoId" element={<VideoPlayer />} />
      <Route path="/portal/tests/:testId" element={<TestTake />} />
      <Route path="/portal/attempts/:attemptId" element={<AttemptDetail />} />
      <Route path="/portal/history" element={<History />} />
      <Route path="/portal/stats" element={<Stats />} />
    </Routes>
  );
}
