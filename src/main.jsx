import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ThemeProvider from './components/theme-provider'
import App from './profile-app'
import { preloadSection } from './components/section-pane'
import './index.css'

preloadSection()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
