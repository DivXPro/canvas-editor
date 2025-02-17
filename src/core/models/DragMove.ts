import { action, makeObservable, observable } from 'mobx'
import { FederatedPointerEvent } from 'pixi.js'

import { DNode } from '../elements'
import { Vector2 } from '../elements/type'
import { DragMoveEvent, DragStartEvent } from '../events'
import { NodeTransformEvent } from '../events/mutation/DragElementEvent'
import { calculateAngleABC } from '../utils/transform'

import { Engine } from './Engine'
import { Operation } from './Operation'

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

export class DragMove {
  engine: Engine
  operation: Operation

  dragOffsets: Record<string, Vector2> = {}
  dragStartPoint?: Vector2
  dragging = false

  rotates: Record<string, number> = {}
  rotateStartPoint?: Vector2
  rotating = false

  constructor(options: IMoveOptions) {
    this.engine = options.engine
    this.operation = options.operation
    makeObservable(this, {
      dragging: observable,
      dragOffsets: observable,
      dragStart: action.bound,
      dragMove: action.bound,
      dragStop: action.bound,
      triggerMove: action.bound,
    })
  }

  rotateStart(event: FederatedPointerEvent) {
    if (this.operation.selection.selectedNodes.length > 0) {
      this.rotates = {}
      this.rotateStartPoint = {
        x: event.global.x,
        y: event.global.y,
      }
      this.rotating = true

      this.operation.selection.selectedNodes.forEach(node => {
        this.rotates[node.id] = node.rotation
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

  dragStart(event: FederatedPointerEvent) {
    if (this.operation.selection.selectedNodes.length > 0) {
      this.dragging = true
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

  rotateMove(event: FederatedPointerEvent) {
    if (this.operation.selection.selectedNodes.length > 0 && this.rotateStartPoint != null) {
      const distance = Math.sqrt(
        Math.pow(event.globalX - this.rotateStartPoint.x, 2) + Math.pow(event.globalY - this.rotateStartPoint.y, 2)
      )

      if (distance < 5) {
        return
      }

      const rotatePoint = {
        x: event.globalX,
        y: event.globalY,
      }

      const rect = this.operation.selection.selectedRectPoints
      const center = {
        x: (rect[0].x + rect[2].x) / 2,
        y: (rect[0].y + rect[2].y) / 2,
      }
      const angle = calculateAngleABC(this.rotateStartPoint as Vector2, center, rotatePoint)

      this.operation.selection.selectedNodes.forEach(node => {
        if (!node.locked) {
          const rotate = this.rotates[node.id]

          if (rotate == null) {
            return
          }
          // const angle = calculateAngleABC(this.rotateStartPoint as Vector2, node.globalPosition, rotatePoint)

          // 使用取模运算限制角度在 0-360 度范围内
          const newRotation = (rotate + (Math.PI * angle) / 180) % (Math.PI * 2)

          this.triggerRotation(node, newRotation)
        }
      })

      const rotateMoveEvent = new DragMoveEvent({
        clientX: event.clientX,
        clientY: event.clientY,
        pageX: event.pageX,
        pageY: event.pageY,
        target: event.target,
        view: event.view,
        canvasX: event.global.x,
        canvasY: event.global.y,
      })

      this.engine.events.emit(rotateMoveEvent.type, rotateMoveEvent)
    }
  }

  dragMove(event: FederatedPointerEvent) {
    if (this.dragStartPoint == null) {
      return
    }
    const distance = Math.sqrt(
      Math.pow(event.clientX - this.dragStartPoint.x, 2) + Math.pow(event.clientY - this.dragStartPoint.y, 2)
    )

    if (distance < 5) {
      return
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

        this.triggerMove(node, vector)
      }
    })
    // const dragMoveEvent = new DragMoveEvent({
    //   clientX: event.clientX,
    //   clientY: event.clientY,
    //   pageX: event.pageX,
    //   pageY: event.pageY,
    //   target: event.target,
    //   view: event.view,
    //   canvasX: event.global.x,
    //   canvasY: event.global.y,
    // })

    // this.engine.events.emit(dragMoveEvent.type, dragMoveEvent)
  }

  rotateStop(event: FederatedPointerEvent) {
    console.log('rotateStop')
    this.rotating = false
    this.rotates = {}
    this.rotateStartPoint = undefined

    // const dragStopEvent = new DragStopEvent({
    //   clientX: event.clientX,
    //   clientY: event.clientY,
    //   pageX: event.pageX,
    //   pageY: event.pageY,
    //   target: event.target,
    //   view: event.view,
    //   canvasX: event.global.x,
    //   canvasY: event.global.y,
    // })

    // this.engine.events.emit(dragStopEvent.type, dragStopEvent)
  }

  dragStop(event: FederatedPointerEvent) {
    this.dragging = false
    this.dragOffsets = {}
    this.dragStartPoint = undefined

    // const dragStopEvent = new DragStopEvent({
    //   clientX: event.clientX,
    //   clientY: event.clientY,
    //   pageX: event.pageX,
    //   pageY: event.pageY,
    //   target: event.target,
    //   view: event.view,
    //   canvasX: event.global.x,
    //   canvasY: event.global.y,
    // })

    // this.engine.events.emit(dragStopEvent.type, dragStopEvent)
  }

  triggerMove(node: DNode, position: Vector2) {
    node.moveTo(position)
    this.engine.events.emit(
      'node:transform',
      new NodeTransformEvent({
        source: node,
        transform: {
          position,
        },
      })
    )
  }

  triggerRotation(node: DNode, rotation: number) {
    node.rotation = rotation
    this.engine.events.emit(
      'node:transform',
      new NodeTransformEvent({
        source: node,
        transform: {
          rotation,
        },
      })
    )
  }
}
