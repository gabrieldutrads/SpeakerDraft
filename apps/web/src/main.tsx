import React from 'react'
import ReactDOM from 'react-dom/client'
import { Providers } from './app/providers'
import { Router } from './app/router'
import './styles/globals.css'
import './styles/tokens.css'
import './styles/primereact.css'
import './styles/utilities.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Providers>
      <Router />
    </Providers>
  </React.StrictMode>,
)