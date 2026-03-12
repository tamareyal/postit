import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css' 
import AuthPage from './pages/AuthPage'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

const app = (
  <StrictMode>
    <AuthProvider>
      <AuthPage />
    </AuthProvider>
  </StrictMode>
)

createRoot(document.getElementById('root')!).render(
  googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId} locale="en">{app}</GoogleOAuthProvider>
  ) : (
    app
  )
)