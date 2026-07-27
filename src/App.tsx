import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { SiteContentProvider } from '@/context/SiteContentContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LandingPage from '@/pages/LandingPage';
import ToolsPage from '@/pages/ToolsPage';
import ToolDetailPage from '@/pages/ToolDetailPage';
import ResourcesPage from '@/pages/ResourcesPage';
import ResourceDetailPage from '@/pages/ResourceDetailPage';
import AssistantPage from '@/pages/AssistantPage';
import PricingPage from '@/pages/PricingPage';
import AuthPage from '@/pages/AuthPage';
import DashboardPage from '@/pages/DashboardPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SiteContentProvider>
          <AuthProvider>
            <BrowserRouter>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/tools" element={<ToolsPage />} />
                    <Route path="/tools/:slug" element={<ToolDetailPage />} />
                    <Route path="/resources" element={<ResourcesPage />} />
                    <Route path="/resources/:id" element={<ResourceDetailPage />} />
                    <Route path="/assistant" element={<AssistantPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/login" element={<AuthPage mode="login" />} />
                    <Route path="/signup" element={<AuthPage mode="signup" />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/admin" element={<AdminDashboardPage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </BrowserRouter>
          </AuthProvider>
        </SiteContentProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
