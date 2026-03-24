// ============================================================
// App.tsx — Route configuration for Security RMF Platform
// Three portals: Command Center (大屏) / Admin (业务) / Mobile (移动)
// ============================================================
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import Home from "./pages/Home";
import CommandCenter from "./pages/CommandCenter";
import AdminDashboard from "./pages/AdminDashboard";
import RobotManagement from "./pages/RobotManagement";
import TaskScheduler from "./pages/TaskScheduler";
import AlertCenter from "./pages/AlertCenter";
import PatrolRoutes from "./pages/PatrolRoutes";
import VisitorManagement from "./pages/VisitorManagement";
import GuardSchedule from "./pages/GuardSchedule";
import SystemSettings from "./pages/SystemSettings";
import VueMobileWrapper from "./pages/VueMobileWrapper";
import VideoMonitor from "./pages/VideoMonitor";
import PresetPlans from "./pages/PresetPlans";

function Router() {
  return (
    <Switch>
      {/* Platform entry */}
      <Route path="/" component={Home} />

      {/* Command Center — 大屏端 */}
      <Route path="/command" component={CommandCenter} />

      {/* Admin Portal — 业务端 */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/robots" component={RobotManagement} />
      <Route path="/admin/tasks" component={TaskScheduler} />
      <Route path="/admin/alerts" component={AlertCenter} />
      <Route path="/admin/patrol" component={PatrolRoutes} />
      <Route path="/admin/visitors" component={VisitorManagement} />
      <Route path="/admin/guards" component={GuardSchedule} />
      <Route path="/admin/settings" component={SystemSettings} />
      <Route path="/admin/video" component={VideoMonitor} />
      <Route path="/admin/presets" component={PresetPlans} />

      {/* Mobile App — 移动端（Vue 3 SFC） */}
      <Route path="/mobile" component={VueMobileWrapper} />

      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'oklch(0.17 0.025 240)',
                border: '1px solid rgba(56,189,248,0.2)',
                color: 'oklch(0.93 0.01 230)',
              },
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
