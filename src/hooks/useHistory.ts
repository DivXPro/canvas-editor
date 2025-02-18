import { useOperation } from './useOperation'

export const useHistory = () => {
  const operation = useOperation()

  return operation?.history
}
