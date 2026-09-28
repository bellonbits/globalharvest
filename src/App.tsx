import { LazyMotion, MotionConfig, domMax } from 'framer-motion'
import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { ToastProvider } from './components/ui/Toast'
import Home from './pages/Home'

// Every page except Home is code-split so the landing page stays light.
const About = lazy(() => import('./pages/About'))
const BibleStudy = lazy(() => import('./pages/BibleStudy'))
const Prayer = lazy(() => import('./pages/Prayer'))
const Community = lazy(() => import('./pages/Community'))
const Mission = lazy(() => import('./pages/Mission'))
const Events = lazy(() => import('./pages/Events'))
const EventDetail = lazy(() => import('./pages/EventDetail'))
const Resources = lazy(() => import('./pages/Resources'))
const Join = lazy(() => import('./pages/Join'))
const Register = lazy(() => import('./pages/Register'))
const RegisterWelcome = lazy(() => import('./pages/RegisterWelcome'))
const Contact = lazy(() => import('./pages/Contact'))
const MediaKit = lazy(() => import('./pages/MediaKit'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const NotFound = lazy(() => import('./pages/NotFound'))
// The admin portal is a separate bundle — public visitors never download it.
const AdminApp = lazy(() => import('./admin/AdminApp'))

const router = createBrowserRouter([
  {
    path: '/admin/*',
    element: (
      <Suspense fallback={<div className="min-h-screen bg-[#f4f2ee]" />}>
        <AdminApp />
      </Suspense>
    ),
  },
  {
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'bible-study', element: <BibleStudy /> },
      { path: 'prayer', element: <Prayer /> },
      { path: 'community', element: <Community /> },
      { path: 'mission', element: <Mission /> },
      { path: 'global-mission', element: <Mission /> },
      { path: 'events', element: <Events /> },
      { path: 'events/:slug', element: <EventDetail /> },
      { path: 'resources', element: <Resources /> },
      { path: 'join', element: <Join /> },
      { path: 'register', element: <Register /> },
      { path: 'register/welcome', element: <RegisterWelcome /> },
      { path: 'contact', element: <Contact /> },
      { path: 'media-kit', element: <MediaKit /> },
      { path: 'privacy', element: <Privacy /> },
      { path: 'terms', element: <Terms /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

export default function App() {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </MotionConfig>
    </LazyMotion>
  )
}
