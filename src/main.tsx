import React from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './styles/fonts.css'
import './index.css'
import { PostHogProvider } from 'posthog-js/react'

const root = createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <PostHogProvider
        apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
        options={{
          api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
          defaults: '2025-05-24',
          capture_exceptions: true,
          debug: import.meta.env.MODE === 'development',
          // Each capture goes out on its own instead of in a shared 3 s batch. On leaving,
          // posthog-js then beacons $pageleave first, ahead of the recording's last upload
          // (which also keeps within posthog-js's own share of the budget). Batched, the
          // recording could go first (whichever was queued first leads) and use up the
          // browser's ~64 KB unload budget, so the $pageleave beacon after it was refused.
          request_batching: false,
          disable_session_recording: false,
          session_recording: {
            maskAllInputs: false,
            maskInputOptions: {
              password: true,
            },
          },
        }}
      >
        <App />
      </PostHogProvider>
    </HelmetProvider>
  </React.StrictMode>
)
