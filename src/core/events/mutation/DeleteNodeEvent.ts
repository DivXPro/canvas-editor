import { AbstractMutationNodeEvent } from './AbstractMutationNodeEvent'

export class DeleteNodeEvent extends AbstractMutationNodeEvent {
  type = 'node:delete'
}
