import { useWorkbench } from './useWorkbench'

export const useSelection = () => {
  const workbench = useWorkbench()

  return workbench.selection
}
