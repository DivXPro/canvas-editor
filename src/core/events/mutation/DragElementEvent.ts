import { Vector2 } from '../../elements'

import { AbstractMutationElementEvent, IMutationElementEventData } from './AbstractMutationElementEvent'

export interface NodeTransformData extends IMutationElementEventData {
  transform: {
    position?: Vector2
    rotation?: number
  }
}

export class NodeTransformEvent extends AbstractMutationElementEvent<NodeTransformData> {
  type = 'node:transform'
}
