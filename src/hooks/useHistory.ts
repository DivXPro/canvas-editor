import { useWorkspace } from './useWorkspace'

export const useHistory = () => {
  const operation = useWorkspace()

  return operation?.history
}
