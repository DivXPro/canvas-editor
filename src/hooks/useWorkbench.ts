import { useEngine } from './useEngine'

export const useWorkbench = () => {
  const engine = useEngine()

  return engine?.workbench
}
