import { AuthProvider } from '@/hooks/use-auth';
import { I18nProvider } from '@/hooks/use-i18n';
import { ThemeProvider } from '@/hooks/use-theme';
import { useRoute, matchRoute } from '@/lib/router';
import { Navbar } from '@/components/site/navbar';
import { Footer } from '@/components/site/footer';
import { LandingPage } from '@/pages/landing';
import { ToolsPage } from '@/pages/tools';
import { ToolDetailPage } from '@/pages/tool-detail';
import { ResourcesPage } from '@/pages/resources';
import { CategoriesPage } from '@/pages/categories';
import { PricingPage } from '@/pages/pricing';
import { AuthPage } from '@/pages/auth';
import { DashboardPage } from '@/pages/dashboard';
import { AdminShell } from '@/components/admin/admin-shell';
import { AdminOverview } from '@/pages/admin/overview';
import { AdminTools } from '@/pages/admin/admin-tools';
import { AdminCategories } from '@/pages/admin/admin-categories';
import { AdminResources } from '@/pages/admin/admin-resources';
import { AdminProviders } from '@/pages/admin/admin-providers';
import { AdminSettings } from '@/pages/admin/admin-settings';
import { AdminUsers } from '@/pages/admin/admin-users';
import { Toaster } from 'sonner';

function Routes() {
  const route = useRoute();
  const path = route.path;

  if (path === '/admin' || path.startsWith('/admin/')) {
    let content;
    if (path === '/admin') content = <AdminOverview />;
    else if (path === '/admin/tools') content = <AdminTools />;
    else if (path === '/admin/categories') content = <AdminCategories />;
    else if (path === '/admin/resources') content = <AdminResources />;
    else if (path === '/admin/users') content = <AdminUsers />;
    else if (path === '/admin/providers') content = <AdminProviders />;
    else if (path === '/admin/settings') content = <AdminSettings />;
    else content = <AdminOverview />;
    return <AdminShell>{content}</AdminShell>;
  }

  let page;
  if (path === '/') page = <LandingPage />;
  else if (path === '/tools') page = <ToolsPage />;
  else if (path === '/resources') page = <ResourcesPage />;
  else if (path === '/categories') page = <CategoriesPage />;
  else if (path === '/pricing') page = <PricingPage />;
  else if (path === '/signin') page = <AuthPage mode="signin" />;
  else if (path === '/signup') page = <AuthPage mode="signup" />;
  else if (path === '/dashboard') page = <DashboardPage />;
  else {
    const m = matchRoute('/tools/:slug', path);
    if (m) page = <ToolDetailPage slug={m.slug} />;
    else page = <LandingPage />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">{page}</div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <Routes />
          <Toaster theme="dark" position="top-right" />
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
