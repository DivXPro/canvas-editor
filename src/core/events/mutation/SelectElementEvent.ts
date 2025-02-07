import { AbstractMutationElementEvent } from './AbstractMutationElementEvent'

export class SelectElementEvent extends AbstractMutationElementEvent {
  type = 'element:select:'
}

export class UnselectElementEvent extends AbstractMutationElementEvent {
  type = 'element:unselect'
}

export class HoverElementEvent extends AbstractMutationElementEvent {
  type = 'element:hover'
}
