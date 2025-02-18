import { createContext } from 'react'

import { Engine } from '@/core'

export const CanvasEngineContext = createContext<Engine | null>(null)
