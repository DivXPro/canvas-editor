import { useWorkbench } from './useWorkbench'

export const useHistory = () => {
  const operation = useWorkbench()

  return operation?.history
}
