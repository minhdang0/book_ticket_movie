import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { UserProvider } from './contexts/UserContext.tsx'
import { LoadingProvider } from './contexts/LoadingContext.tsx'

createRoot(document.getElementById('root')!).render(
  <UserProvider>
    <LoadingProvider>
      <App />
    </LoadingProvider>
  </UserProvider>
)
