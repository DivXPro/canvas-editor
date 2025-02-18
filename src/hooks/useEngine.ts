import { useContext } from 'react'

import { Engine } from '../core/models'
import { CanvasEngineContext } from '../context'

export const useEngine = (): Engine => {
  const engine = useContext(CanvasEngineContext)

  if (engine == null) {
    throw new Error('engine not exists')
  }

  return engine
}
