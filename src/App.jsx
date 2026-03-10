import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CameraDashboard from './pages/CameraDashboard';
import OwlyticsDashboard from './pages/OwlyticsDashboard';
import EntranceDashboard from './pages/EntranceDashboard';
import WorkspaceDashboard from './pages/WorkspaceDashboard';

function App() {
  return (
    <Router>
      <Routes>
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
    </Router>
  );
}

export default App;
