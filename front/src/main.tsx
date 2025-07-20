import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Cursor } from './Cursor.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Cursor />
  </StrictMode>,
)
