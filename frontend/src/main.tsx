import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './api/configuracionAxios'
import { AppRoutes } from './routes'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRoutes />
  </StrictMode>
)
