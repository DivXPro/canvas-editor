import { Vector2 } from '../../elements'

import { AbstractMutationElementEvent, IMutationElementEventData } from './AbstractMutationElementEvent'

export interface ElementDragData extends IMutationElementEventData {
  position: Vector2
}
export class DragElementEvent extends AbstractMutationElementEvent<ElementDragData> {
  type = 'element:drag'
}

export interface ElementRotateData extends IMutationElementEventData {
  rotate: number
}

export class RotateElementEvent extends AbstractMutationElementEvent<ElementDragData> {
  type = 'element:rotate'
}
