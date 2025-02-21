import { AbstractMutationNodeEvent } from './AbstractMutationElementEvent'

export class SelectElementEvent extends AbstractMutationNodeEvent {
  type = 'element:select'
}

export class UnselectElementEvent extends AbstractMutationNodeEvent {
  type = 'element:unselect'
}

export class HoverElementEvent extends AbstractMutationNodeEvent {
  type = 'element:hover'
}
