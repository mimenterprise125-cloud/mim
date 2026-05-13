import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { AuthProvider } from '@/lib/auth-context'
import { RefreshProvider } from '@/lib/refresh-context'
import { Header } from '@/components/site/Header'
import { WhatsAppFab } from '@/components/site/WhatsAppFab'
import { LoadingScreen } from '@/components/site/LoadingScreen'
import { useLocation } from 'react-router-dom'

// Import all pages
import HomePage from '@/routes/index'
import LoginPage from '@/routes/login'
import DashboardPage from '@/routes/dashboard'
import LeadsPage from '@/routes/leads'
import ProjectsPage from '@/routes/projects'
import ProjectsCrmPage from '@/routes/projects-crm'
import PaymentsPage from '@/routes/payments'
import EmployeesPage from '@/routes/employees'
import ConfiguratorPage from '@/routes/configurator'
import ProductsPage from '@/routes/products'
import ContactPage from '@/routes/contact'

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl text-gradient-gold">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This door leads nowhere. Let's take you home.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium btn-luxe"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  )
}

function RootLayoutInner() {
  const location = useLocation()

  // Hide header on login and protected pages
  const hiddenRoutes = ['/login', '/dashboard', '/leads', '/projects-crm', '/payments', '/employees', '/configurator']
  const shouldShowHeader = !hiddenRoutes.some(route => location.pathname.startsWith(route))
  const shouldShowWhatsApp = !hiddenRoutes.some(route => location.pathname.startsWith(route))

  return (
    <>
      <LoadingScreen />
      {shouldShowHeader && <Header />}
      <main className="relative">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects-crm" element={<ProjectsCrmPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/configurator" element={<ConfiguratorPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundComponent />} />
        </Routes>
      </main>
      {shouldShowWhatsApp && <WhatsAppFab />}
    </>
  )
}

function RootLayout() {
  return (
    <AuthProvider>
      <RefreshProvider>
        <RootLayoutInner />
      </RefreshProvider>
    </AuthProvider>
  )
}

export default function App() {
  return (
    <Router>
      <RootLayout />
    </Router>
  )
}
