import { lazy } from 'react';

import { Navigate } from 'react-router-dom';

const Logout = lazy(() => import('@/pages/Logout.jsx'));
const NotFound = lazy(() => import('@/pages/NotFound.jsx'));


const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Customer = lazy(() => import('@/pages/Customer'));
const Parent = lazy(() => import('@/pages/Parent'));
const Group = lazy(() => import('@/pages/Group'));
const Staff = lazy(() => import('@/pages/Staff'));
const Attendance = lazy(() => import('@/pages/Attendance'));
const AttendanceReport = lazy(() => import('@/pages/Attendance/MonthlyReport'));
const Assistant = lazy(() => import('@/pages/Assistant'));
const MonthlyPayment = lazy(() => import('@/pages/MonthlyPayment'));
const PaymentHistory = lazy(() => import('@/pages/PaymentHistory'));
const PaymentReport = lazy(() => import('@/pages/PaymentHistory/MonthlyReport'));
const Invoice = lazy(() => import('@/pages/Invoice'));
const InvoiceCreate = lazy(() => import('@/pages/Invoice/InvoiceCreate'));

const InvoiceRead = lazy(() => import('@/pages/Invoice/InvoiceRead'));
const InvoiceUpdate = lazy(() => import('@/pages/Invoice/InvoiceUpdate'));
const InvoiceRecordPayment = lazy(() => import('@/pages/Invoice/InvoiceRecordPayment'));

const Subject = lazy(() => import('@/pages/Subject'));
const Test = lazy(() => import('@/pages/Test'));
const TestAiImport = lazy(() => import('@/pages/Test/AiImport'));
const TestStats = lazy(() => import('@/pages/Test/TestStats'));
const Question = lazy(() => import('@/pages/Question'));
const VideoLesson = lazy(() => import('@/pages/VideoLesson'));
const Book = lazy(() => import('@/pages/Book'));
const Reward = lazy(() => import('@/pages/Reward'));
const RewardOrder = lazy(() => import('@/pages/RewardOrder'));

const Settings = lazy(() => import('@/pages/Settings/Settings'));


const Profile = lazy(() => import('@/pages/Profile'));

const About = lazy(() => import('@/pages/About'));

let routes = {
  expense: [],
  default: [
    {
      path: '/login',
      element: <Navigate to="/" />,
    },
    {
      path: '/logout',
      element: <Logout />,
    },
    {
      path: '/about',
      element: <About />,
    },
    {
      path: '/',
      element: <Dashboard />,
    },
    {
      path: '/attendance',
      element: <Attendance />,
    },
    {
      path: '/attendance-report',
      element: <AttendanceReport />,
    },
    {
      path: '/assistant',
      element: <Assistant />,
    },
    {
      path: '/monthly-payments',
      element: <MonthlyPayment />,
    },
    {
      path: '/payment-history',
      element: <PaymentHistory />,
    },
    {
      path: '/payment-report',
      element: <PaymentReport />,
    },
    {
      path: '/customer',
      element: <Customer />,
    },
    {
      path: '/parent',
      element: <Parent />,
    },
    {
      path: '/group',
      element: <Group />,
    },
    {
      path: '/staff',
      element: <Staff />,
    },

    {
      path: '/subject',
      element: <Subject />,
    },
    {
      path: '/test',
      element: <Test />,
    },
    {
      path: '/test/ai-import',
      element: <TestAiImport />,
    },
    {
      path: '/test/stats',
      element: <TestStats />,
    },
    {
      path: '/question',
      element: <Question />,
    },
    {
      path: '/video-lesson',
      element: <VideoLesson />,
    },
    {
      path: '/book',
      element: <Book />,
    },
    {
      path: '/reward',
      element: <Reward />,
    },
    {
      path: '/rewardorder',
      element: <RewardOrder />,
    },

    {
      path: '/invoice',
      element: <Invoice />,
    },
    {
      path: '/invoice/create',
      element: <InvoiceCreate />,
    },
    {
      path: '/invoice/read/:id',
      element: <InvoiceRead />,
    },
    {
      path: '/invoice/update/:id',
      element: <InvoiceUpdate />,
    },
    {
      path: '/invoice/pay/:id',
      element: <InvoiceRecordPayment />,
    },

    {
      path: '/settings',
      element: <Settings />,
    },
    {
      path: '/settings/edit/:settingsKey',
      element: <Settings />,
    },
    {
      path: '/profile',
      element: <Profile />,
    },
    {
      path: '*',
      element: <NotFound />,
    },
  ],
};

export default routes;
