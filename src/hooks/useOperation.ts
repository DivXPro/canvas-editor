import { useEngine } from './useEngine'

export const useOperation = () => {
  const engine = useEngine()

  return engine?.workbench
}
