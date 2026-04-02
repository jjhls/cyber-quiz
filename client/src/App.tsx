import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import ContestListPage from './pages/ContestListPage'
import ContestDetailPage from './pages/ContestDetailPage'
import ExamPage from './pages/ExamPage'
import ExamResultPage from './pages/ExamResultPage'
import PracticePage from './pages/PracticePage'
import RankingPage from './pages/RankingPage'
import WrongBookPage from './pages/WrongBookPage'
import ProfilePage from './pages/ProfilePage'
import HistoryPage from './pages/HistoryPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminQuestions from './pages/admin/AdminQuestions'
import AdminContests from './pages/admin/AdminContests'
import AdminUsers from './pages/admin/AdminUsers'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected user routes */}
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<HomePage />} />
        <Route path="contests" element={<ContestListPage />} />
        <Route path="contests/:id" element={<ContestDetailPage />} />
        <Route path="contests/:id/exam" element={<ExamPage />} />
        <Route path="contests/:id/result" element={<ExamResultPage />} />
        <Route path="practice" element={<PracticePage />} />
        <Route path="rankings" element={<RankingPage />} />
        <Route path="wrong-book" element={<WrongBookPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="history" element={<HistoryPage />} />
      </Route>

      {/* Protected admin routes */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="questions" element={<AdminQuestions />} />
        <Route path="contests" element={<AdminContests />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
