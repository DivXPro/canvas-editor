import { useWorkspace } from './useWorkspace'

export const useSelection = () => {
  const workbench = useWorkspace()

  return workbench.selection
}
