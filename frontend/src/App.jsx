import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleProtectedRoute from './components/common/RoleProtectedRoute';
import Layout from './components/common/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CallsPage from './pages/CallsPage';
import CallDetailPage from './pages/CallDetailPage';
import EvaluationsPage from './pages/EvaluationsPage';
import ReportsPage from './pages/ReportsPage';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/calls"
            element={
              <ProtectedRoute>
                <Layout>
                  <CallsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/calls/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <CallDetailPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/evaluations"
            element={
              <ProtectedRoute>
                <Layout>
                  <EvaluationsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['admin', 'supervisor']}>
                  <Layout>
                    <ReportsPage />
                  </Layout>
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
