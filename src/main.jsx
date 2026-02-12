import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LanguageProvider } from './context/LanguageContext'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './Login.jsx'
import Home from './Home.jsx'
import Learn from './Learn.jsx'
import Games from './Games.jsx'
import ProgressPage from './ProgressPage.jsx'
import ChakraOfKnowledge from './ChakraOfKnowledge.jsx'
import RightsDutiesClimb from './RightsDutiesClimb.jsx'
import ConstitutionCards from './ConstitutionCards.jsx'
import ArticleMatch from './ArticleMatch.jsx'
import Quiz from './Quiz.jsx'
import ProfilePage from './ProfilePage.jsx'
import ConstitutionalSort from './ConstitutionalSort.jsx'
import ConstitutionalCrossroads from './ConstitutionalCrossroads.jsx'

import ProtectedRoute from './ProtectedRoute.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />
  },
  {
    path: '/home',
    element: <ProtectedRoute><Home /></ProtectedRoute>
  },
  {
    path: '/learn',
    element: <ProtectedRoute><Learn /></ProtectedRoute>
  },
  {
    path: '/games',
    element: <ProtectedRoute><Games /></ProtectedRoute>
  },
  {
    path: '/progress',
    element: <ProtectedRoute><ProgressPage /></ProtectedRoute>
  },
  {
    path: '/games/spin-wheel',
    element: <ProtectedRoute><ChakraOfKnowledge /></ProtectedRoute>
  },
  {
    path: 'games/snake-ladder',
    element: <ProtectedRoute><RightsDutiesClimb /></ProtectedRoute>
  },
  {
    path: '/games/quiz-cards',
    element: <ProtectedRoute><ConstitutionCards /></ProtectedRoute>
  },
  {
    path: '/games/match-pairs',
    element: <ProtectedRoute><ArticleMatch /></ProtectedRoute>
  },
  {
    path: '/games/quiz',
    element: <ProtectedRoute><Quiz /></ProtectedRoute>
  },
  {
    path: '/games/constitutional-sort',
    element: <ProtectedRoute><ConstitutionalSort /></ProtectedRoute>
  },
  {
    path: '/games/constitutional-crossroads',
    element: <ProtectedRoute><ConstitutionalCrossroads /></ProtectedRoute>
  },

  {
    path: '/profile',
    element: <ProtectedRoute><ProfilePage /></ProtectedRoute>
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </LanguageProvider>
  </StrictMode>,
)

// Register Service Worker for PWA (Only in Production)
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  } else {
    // Proactively unregister service workers in development to avoid cache issues
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let registration of registrations) {
        registration.unregister();
        console.log('SW unregistered in dev mode');
      }
    });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    // e.preventDefault();
    console.log('PWA: Ready to be installed');
  });

  window.addEventListener('appinstalled', (evt) => {
    console.log('PWA: Successfully installed');
  });
}

