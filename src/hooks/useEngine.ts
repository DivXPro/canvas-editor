import { useContext } from 'react'

import { Engine } from '../core/models'
import { EditorEngineContext } from '../context'

export const useEngine = (): Engine => {
  const engine = useContext(EditorEngineContext)

  if (engine == null) {
    throw new Error('engine not exists')
  }

  return engine
}
