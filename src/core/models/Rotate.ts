import { action, makeObservable, observable } from 'mobx'
import { FederatedPointerEvent } from 'pixi.js'

import { Engine } from '../Engine'
import { DNode } from '../elements'
import { Vector2 } from '../elements/type'
import { DragMoveEvent, DragStartEvent, DragStopEvent } from '../events'

import { Operation } from './Operation'
import { DragElementEvent } from '../events/mutation/DragElementEvent'

export interface IMoveOptions {
  engine: Engine
  operation: Operation
}

export interface IMoveDragStartPorps {
  point: Vector2
}
export interface IMoveDragMovePorps {
  point: Vector2
}

export interface IMoveDragDropPorps {
  point: Vector2
}

export class Rotate {
  engine: Engine
  operation: Operation
  dragOffsets: Record<string, Vector2> = {}
  dragStartPoint?: Vector2
  dragging = false

  constructor(options: IMoveOptions) {
    this.engine = options.engine
    this.operation = options.operation
    makeObservable(this, {
      dragging: observable,
      dragOffsets: observable,
      dragStart: action.bound,
      dragMove: action.bound,
      dragStop: action.bound,
      trigger: action.bound,
    })
  }

  dragStart(event: FederatedPointerEvent) {
    if (this.operation.selection.selectedNodes.length > 0) {
      this.dragOffsets = {}
      this.dragStartPoint = { x: event.clientX, y: event.clientY }
      this.operation.selection.selectedNodes.forEach(node => {
        this.dragOffsets[node.id] = {
          x: node.position.x - event.clientX,
          y: node.position.y - event.clientY,
        }
      })

      const dragStartEvent = new DragStartEvent({
        clientX: event.clientX,
        clientY: event.clientY,
        pageX: event.pageX,
        pageY: event.pageY,
        target: event.target,
        view: event.view,
        canvasX: event.global.x,
        canvasY: event.global.y,
      })

      this.engine.events.emit(dragStartEvent.type, dragStartEvent)
    }
  }

  dragMove(event: FederatedPointerEvent) {
    if (!this.dragging) {
      if (this.dragStartPoint == null) {
        return
      }
      const distance = Math.sqrt(
        Math.pow(event.clientX - this.dragStartPoint.x, 2) + Math.pow(event.clientY - this.dragStartPoint.y, 2)
      )

      if (distance < 5) {
        return
      }
      this.dragging = true
    }

    // 移动选中的节点
    this.operation.selection.selectedNodes.forEach(node => {
      if (!node.locked) {
        const offset = this.dragOffsets[node.id]
        // 检查节点是否被锁定
        const vector = {
          x: event.clientX + offset.x,
          y: event.clientY + offset.y,
        }

        this.trigger(node, vector)
      }
    })
    const dragMoveEvent = new DragMoveEvent({
      clientX: event.clientX,
      clientY: event.clientY,
      pageX: event.pageX,
      pageY: event.pageY,
      target: event.target,
      view: event.view,
      canvasX: event.global.x,
      canvasY: event.global.y,
    })

    this.engine.events.emit(dragMoveEvent.type, dragMoveEvent)
  }

  dragStop(event: FederatedPointerEvent) {
    this.dragging = false
    this.dragOffsets = {}
    this.dragStartPoint = undefined

    const dragStopEvent = new DragStopEvent({
      clientX: event.clientX,
      clientY: event.clientY,
      pageX: event.pageX,
      pageY: event.pageY,
      target: event.target,
      view: event.view,
      canvasX: event.global.x,
      canvasY: event.global.y,
    })

    this.engine.events.emit(dragStopEvent.type, dragStopEvent)
  }

  trigger(node: DNode, position: Vector2) {
    node.moveTo(position)
    this.engine.events.emit(
      'element:drag',
      new DragElementEvent({
        source: node,
        position,
      })
    )
  }
}
