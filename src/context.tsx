import { createContext } from 'react'

import { Engine } from '@/core'

export const EditorEngineContext = createContext<Engine | null>(null)
