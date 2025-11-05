

import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import SigninPage from './pages/LoginPage'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import SignupPage from './pages/SignUpPage'

function App() {


  return (
    <>
<BrowserRouter>
      <Routes>
        {
        <Route path="/" element={<Dashboard />} /> }
        <Route path="/login" element={<SigninPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* 👇 This is the crucial part 👇 */}
        <Route 
          path="/auth/google/callback" 
          element={<AuthCallback />} 
        />
        
        {/* Other routes... */}
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
