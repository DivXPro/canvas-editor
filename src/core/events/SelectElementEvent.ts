import { AbstractMutationElementEvent } from './AbstractMutationElementEvent'

export class SelectElementEvent extends AbstractMutationElementEvent {
  type = 'select:element'
}

export class UnselectElementEvent extends AbstractMutationElementEvent {
  type = 'unselect:element'
}
