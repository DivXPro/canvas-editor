import { Position } from '../../elements'
import { ICustomEvent } from '../event'

import { AbstractMutationNodeEvent, IMutatioNodeEventData } from './AbstractMutationElementEvent'

export interface NodeTransformData extends IMutatioNodeEventData {
  transform: {
    position?: Position
    rotation?: number
  }
}

export interface NodeDragData extends IMutatioNodeEventData {
  position: Position
}

export interface RotateNodeData extends IMutatioNodeEventData {
  rotation: number
}

export interface ResizeNodeData extends IMutatioNodeEventData {
  resize: number
}

export class NodeTransformEvent extends AbstractMutationNodeEvent<NodeTransformData> {
  type = 'node:transform'
}

export class DragNodeEvent extends AbstractMutationNodeEvent<NodeDragData> implements ICustomEvent {
  type = 'node:drag'
}

export class DragNodeEndEvent extends AbstractMutationNodeEvent implements ICustomEvent {
  type = 'node:dragEnd'
}

export class RotateNodeEvent extends AbstractMutationNodeEvent<RotateNodeData> implements ICustomEvent {
  type = 'node:rotate'
}

export class RotateNodeEndEvent extends AbstractMutationNodeEvent<RotateNodeData> implements ICustomEvent {
  type = 'node:rotate'
}

export class ResizeNodeEvent extends AbstractMutationNodeEvent<ResizeNodeData> implements ICustomEvent {
  type = 'node:resize'
}

export class ResizeNodeEndEvent extends AbstractMutationNodeEvent<ResizeNodeData> implements ICustomEvent {
  type = 'node:resize'
}
