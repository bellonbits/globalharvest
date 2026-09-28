import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { AdminLayout, Guard, RequireAuth } from './components/Layout'
import { Button, EmptyState, LoadingBlock } from './components/ui'
import type { Permission } from './rbac'
import { ForgotPasswordPage, LoginPage, ResetPasswordPage } from './pages/AuthPages'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Registrations = lazy(() => import('./pages/Registrations'))
const RegistrationDetail = lazy(() => import('./pages/Registrations').then((m) => ({ default: m.RegistrationDetail })))
const Members = lazy(() => import('./pages/Members'))
const MemberDetail = lazy(() => import('./pages/Members').then((m) => ({ default: m.MemberDetail })))
const Events = lazy(() => import('./pages/Events'))
const EventFormPage = lazy(() => import('./pages/Events').then((m) => ({ default: m.EventFormPage })))
const EventDetail = lazy(() => import('./pages/Events').then((m) => ({ default: m.EventDetail })))
const EventRegistrations = lazy(() => import('./pages/Events').then((m) => ({ default: m.EventRegistrations })))
const BibleStudies = lazy(() => import('./pages/BibleStudies'))
const BibleStudyFormPage = lazy(() => import('./pages/BibleStudies').then((m) => ({ default: m.BibleStudyFormPage })))
const BibleStudyDetail = lazy(() => import('./pages/BibleStudies').then((m) => ({ default: m.BibleStudyDetail })))
const Prayer = lazy(() => import('./pages/Prayer'))
const Guides = lazy(() => import('./pages/Guides'))
const GuideEditor = lazy(() => import('./pages/Guides').then((m) => ({ default: m.GuideEditor })))
const Groups = lazy(() => import('./pages/Groups'))
const GroupFormPage = lazy(() => import('./pages/Groups').then((m) => ({ default: m.GroupFormPage })))
const GroupDetail = lazy(() => import('./pages/Groups').then((m) => ({ default: m.GroupDetail })))
const Resources = lazy(() => import('./pages/Resources'))
const Content = lazy(() => import('./pages/Content'))
const Media = lazy(() => import('./pages/Media'))
const Messages = lazy(() => import('./pages/Messages'))
const Communications = lazy(() => import('./pages/Communications'))
const Analytics = lazy(() => import('./pages/Analytics'))
const AuditLog = lazy(() => import('./pages/AuditLog'))
const Settings = lazy(() => import('./pages/Settings'))

/** Keeps the admin out of search engines and titles the tab per section. */
function AdminHead() {
  const { pathname } = useLocation()
  useEffect(() => {
    let meta = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'robots'
      document.head.appendChild(meta)
    }
    meta.content = 'noindex, nofollow'
    const section = pathname.split('/')[2] ?? 'dashboard'
    document.title = `${section.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase())} · Admin · Global Harvest`
  }, [pathname])
  return null
}

const P = ({ perm, children }: { perm: Permission; children: ReactNode }) => (
  <Guard permission={perm}>
    <Suspense fallback={<div className="rounded-xl bg-white ring-1 ring-teal-900/10"><LoadingBlock /></div>}>{children}</Suspense>
  </Guard>
)

export default function AdminApp() {
  return (
    <AuthProvider>
      <AdminHead />
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<P perm="dashboard:read"><Dashboard /></P>} />
          <Route path="registrations" element={<P perm="registrations:read"><Registrations /></P>} />
          <Route path="registrations/:id" element={<P perm="registrations:read"><RegistrationDetail /></P>} />
          <Route path="members" element={<P perm="members:read"><Members /></P>} />
          <Route path="members/:id" element={<P perm="members:read"><MemberDetail /></P>} />
          <Route path="events" element={<P perm="events:read"><Events /></P>} />
          <Route path="events/new" element={<P perm="events:write"><EventFormPage /></P>} />
          <Route path="events/:id" element={<P perm="events:read"><EventDetail /></P>} />
          <Route path="events/:id/edit" element={<P perm="events:write"><EventFormPage /></P>} />
          <Route path="events/:id/registrations" element={<P perm="event_registrations:read"><EventRegistrations /></P>} />
          <Route path="bible-studies" element={<P perm="bible_studies:read"><BibleStudies /></P>} />
          <Route path="bible-studies/new" element={<P perm="bible_studies:write"><BibleStudyFormPage /></P>} />
          <Route path="bible-studies/:id" element={<P perm="bible_studies:read"><BibleStudyDetail /></P>} />
          <Route path="bible-studies/:id/edit" element={<P perm="bible_studies:write"><BibleStudyFormPage /></P>} />
          <Route path="prayer" element={<P perm="prayer:read"><Prayer /></P>} />
          <Route path="guides" element={<P perm="guides:read"><Guides /></P>} />
          <Route path="guides/new" element={<P perm="guides:write"><GuideEditor /></P>} />
          <Route path="guides/:id/edit" element={<P perm="guides:read"><GuideEditor /></P>} />
          <Route path="guides/:id" element={<P perm="guides:read"><GuideEditor /></P>} />
          <Route path="groups" element={<P perm="groups:read"><Groups /></P>} />
          <Route path="groups/new" element={<P perm="groups:write"><GroupFormPage /></P>} />
          <Route path="groups/:id" element={<P perm="groups:read"><GroupDetail /></P>} />
          <Route path="resources" element={<P perm="resources:read"><Resources /></P>} />
          <Route path="resources/new" element={<P perm="resources:write"><Resources creating /></P>} />
          <Route path="content" element={<P perm="content:read"><Content /></P>} />
          <Route path="media" element={<P perm="media:read"><Media /></P>} />
          <Route path="messages" element={<P perm="messages:read"><Messages /></P>} />
          <Route path="communications" element={<P perm="communications:read"><Communications /></P>} />
          <Route path="analytics" element={<P perm="analytics:read"><Analytics /></P>} />
          <Route path="audit-log" element={<P perm="audit:read"><AuditLog /></P>} />
          <Route path="settings" element={<Suspense fallback={<LoadingBlock />}><Settings /></Suspense>} />
          <Route path="settings/users" element={<P perm="users:read"><Settings initialTab="users" /></P>} />
          <Route path="settings/roles" element={<Suspense fallback={<LoadingBlock />}><Settings initialTab="roles" /></Suspense>} />
          <Route path="*" element={<div className="rounded-xl bg-white ring-1 ring-teal-900/10"><EmptyState icon="alert" title="Page not found" body="This admin page doesn’t exist." action={<Button to="/admin/dashboard">Back to dashboard</Button>} /></div>} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
