import { AbstractMutationNodeEvent } from './AbstractMutationNodeEvent'

export class SelectNodeEvent extends AbstractMutationNodeEvent {
  type = 'node:select'
}

export class UnselectNodeEvent extends AbstractMutationNodeEvent {
  type = 'node:unselect'
}

export class HoverNodeEvent extends AbstractMutationNodeEvent {
  type = 'node:hover'
}
