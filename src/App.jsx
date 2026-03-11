import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CameraDashboard from './pages/CameraDashboard';
import OwlyticsDashboard from './pages/OwlyticsDashboard';
import EntranceDashboard from './pages/EntranceDashboard';
import WorkspaceDashboard from './pages/WorkspaceDashboard';

function AppRoutes() {
  const location = useLocation();
  const routeKey = location.pathname.startsWith('/dashboard') ? '/dashboard' : location.pathname;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={routeKey}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Navigate to="/dashboard/owlytics" replace />} />
          <Route path="owlytics" element={<OwlyticsDashboard />} />
          <Route path="entrance" element={<EntranceDashboard />} />
          <Route path="workspace" element={<WorkspaceDashboard />} />
          <Route path=":cameraId" element={<CameraDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
