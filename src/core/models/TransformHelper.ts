import { action, makeObservable, observable } from 'mobx'
import { FederatedPointerEvent } from 'pixi.js'

import { DNode } from '../elements'
import { Position } from '../elements/type'
import { DragMoveEvent, DragStartEvent } from '../events'
import { NodeTransformEvent } from '../events/mutation/DragElementEvent'
import { calculateAngleABC } from '../utils/transform'
import { CompositeCommand, MoveCommand, RotationCommand } from '../commands'

import { Engine } from './Engine'
import { Workbench } from './Workbench'

export interface ITransformOptions {
  engine: Engine
  operation: Workbench
}

export class TransformHelper {
  engine: Engine
  operation: Workbench

  nodeInitialPositions: Record<string, Position> = {}
  dragging = 0

  rotates: Record<string, number> = {}
  rotateStartPoint?: Position
  rotating = 0

  constructor(options: ITransformOptions) {
    this.engine = options.engine
    this.operation = options.operation
    makeObservable(this, {
      dragging: observable,
      nodeInitialPositions: observable,
      dragStart: action.bound,
      dragMove: action.bound,
      dragStop: action.bound,
      triggerMove: action.bound,
    })
  }

  // Drag related methods
  dragStart(event: DragStartEvent) {
    if (this.operation.selection.selectedNodes.length > 0) {
      this.dragging = 1
      this.nodeInitialPositions = {}
      this.operation.selection.selectedNodes.forEach(node => {
        this.nodeInitialPositions[node.id] = {
          x: node.position.x,
          y: node.position.y,
        }
      })
      // this.engine.events.emit(dragStartEvent.type, dragStartEvent)
    }
  }

  dragMove(event: DragMoveEvent) {
    if (this.dragging !== 1) {
      return
    }
    const delta = this.engine.cursor.dragStartToCurrentDelta

    // 移动选中的节点
    this.operation.selection.selectedNodes.forEach(node => {
      if (!node.locked) {
        const initialPosition = this.nodeInitialPositions[node.id]
        // 计算鼠标移动的距离
        // 根据初始位置和鼠标移动距离计算新位置
        const newPosition = {
          x: initialPosition.x + delta.offsetX,
          y: initialPosition.y + delta.offsetY,
        }
        this.triggerMove(node, newPosition)
      }
    })
  }

  dragStop() {
    if (this.dragging === 1 && Object.keys(this.nodeInitialPositions).length > 0) {
      const compositeCommand = new CompositeCommand({
        timestamp: Date.now(),
      })

      this.operation.selection.selectedNodes.forEach(node => {
        if (!node.locked) {
          const moveCommand = new MoveCommand(
            node,
            this.engine,
            { position: node.position },
            { position: this.nodeInitialPositions[node.id] }
          )

          compositeCommand.add(moveCommand)
        }
      })
      this.operation.history.push(compositeCommand)
    }

    this.dragging = 0
    this.nodeInitialPositions = {}
  }

  // Rotate related methods
  rotateStart(event: FederatedPointerEvent) {
    if (this.operation.selection.selectedNodes.length > 0) {
      this.rotates = {}
      this.rotateStartPoint = {
        x: event.global.x,
        y: event.global.y,
      }
      this.rotating = 1

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
        offsetX: event.global.x,
        offsetY: event.global.y,
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

      this.rotating = 2

      const rotatePoint = {
        x: event.globalX,
        y: event.globalY,
      }

      const rect = this.operation.selection.selectedRectPoints
      const center = {
        x: (rect[0].x + rect[2].x) / 2,
        y: (rect[0].y + rect[2].y) / 2,
      }
      const angle = calculateAngleABC(this.rotateStartPoint as Position, center, rotatePoint)

      this.operation.selection.selectedNodes.forEach(node => {
        if (!node.locked) {
          const rotate = this.rotates[node.id]

          if (rotate == null) {
            return
          }

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
        offsetX: event.global.x,
        offsetY: event.global.y,
      })

      this.engine.events.emit(rotateMoveEvent.type, rotateMoveEvent)
    }
  }

  rotateStop() {
    if (this.rotating == 2 && Object.keys(this.rotates).length > 0) {
      const compositeCommand = new CompositeCommand({
        timestamp: Date.now(),
      })

      this.operation.selection.selectedNodes.forEach(node => {
        if (!node.locked) {
          const rotateCommand = new RotationCommand(
            node,
            this.engine,
            { rotation: node.rotation },
            { rotation: this.rotates[node.id] }
          )

          compositeCommand.add(rotateCommand)
        }
      })
      this.operation.history.push(compositeCommand)
    }

    this.rotating = 0
    this.rotates = {}
    this.rotateStartPoint = undefined
  }

  // Event trigger methods
  triggerMove(node: DNode, position: Position) {
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
