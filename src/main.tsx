import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css' 
import AuthPage from './pages/AuthPage'
import Header from './components/general/header'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Header />
    <AuthPage />
  </StrictMode>,
)