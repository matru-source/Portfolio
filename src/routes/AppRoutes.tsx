import { Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout'
import { AdminApp } from '@/admin/AdminApp'
import {
  HomePage,
  AboutPage,
  ProjectsPage,
  ExperiencePage,
  CertificationsPage,
  GalleryPage,
  ContactPage,
  NotFoundPage,
} from '@/pages'

export function AppRoutes() {
  return (
    <Routes>
      {/* Admin — standalone, outside the public layout */}
      <Route path="/admin" element={<AdminApp />} />

      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/experience" element={<ExperiencePage />} />
        <Route path="/certifications" element={<CertificationsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
