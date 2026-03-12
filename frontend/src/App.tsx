import { Route, Routes } from 'react-router-dom'
import LoginPage from './pages/auth/Login/Login'
import SignupPage from './pages/auth/Signup/signup'
import HomePage from './pages/user/Home/Home'
import AdminDashboard from './pages/admin/Chat'
import { AdminRoute, UserRoute } from './components/ProtectedRoute'
import RouteGuard from './components/RouteGuard'

function App() {
  return (
    <RouteGuard>
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<LoginPage />} />
        <Route path='/signup' element={<SignupPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/admin/login' element={<LoginPage />} />

        {/* Protected User Routes */}
        <Route path='/user/home' element={
          <UserRoute>
            <HomePage />
          </UserRoute>
        } />
        <Route path='/home' element={
          <UserRoute>
            <HomePage />
          </UserRoute>
        } />

        {/* Protected Admin Routes */}
        <Route path='/admin/chats' element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/organization/dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />

        {/* Fallback Routes */}
        <Route path='/admin' element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path='/dashboard' element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>
    </RouteGuard>
  )
}

export default App