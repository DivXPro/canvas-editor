import { useEngine } from './useEngine'

export const useWorkspace = () => {
  const engine = useEngine()

  return engine?.workspace
}
