import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout      from './components/layout/Layout'
import LandingPage from './pages/LandingPage'
import ResultPage  from './pages/ResultPage'
import Dashboard   from './pages/Dashboard'
import Profile     from './pages/Profile'
import Login       from './pages/Login'
import Register    from './pages/Register'

function Guard({ children }) {
  const token = useAuthStore(s => s.token)
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Layout />}>
          <Route path="/"                         element={<Guard><LandingPage /></Guard>} />
          <Route path="/result/:id"               element={<Guard><ResultPage /></Guard>} />
          <Route path="/dashboard/:id"            element={<Guard><Dashboard /></Guard>} />
          <Route path="/profile"                  element={<Guard><Profile /></Guard>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
