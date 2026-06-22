import { BrowserRouter } from 'react-router-dom'
import { ContentProvider } from '@/content'
import { AuthProvider } from '@/admin/AuthProvider'
import { AppRoutes } from '@/routes/AppRoutes'

export default function App() {
  return (
    <BrowserRouter>
      <ContentProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ContentProvider>
    </BrowserRouter>
  )
}
