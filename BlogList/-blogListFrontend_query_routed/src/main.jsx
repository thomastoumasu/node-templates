import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NotificationContextProvider } from './contexts/NotificationContext'
import { LoginContextProvider } from './contexts/LoginContext'
// import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <NotificationContextProvider>
      <LoginContextProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </LoginContextProvider>
    </NotificationContextProvider>
  </QueryClientProvider>
)