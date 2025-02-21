import { action, makeObservable, observable } from 'mobx'

import { DNode } from '../elements'
import { Position, Size } from '../elements/type'
import { DragMoveEvent, DragStartEvent } from '../events'
import { DragNodeEndEvent, DragNodeEvent, RotateNodeEvent } from '../events/mutation/TransformNodeEvent'
import { calculateAngleABC } from '../utils/transform'
import { CompositeCommand, MoveCommand, RotationCommand } from '../commands'

import { Engine } from './Engine'
import { Workbench } from './Workbench'
import { CornerResizeStyles, CursorDragType, EdgeResizeStyles, RotateStyles } from './Cursor'

export interface ITransformOptions {
  engine: Engine
  operation: Workbench
}

export class TransformHelper {
  engine: Engine
  operation: Workbench

  dragging = false

  nodeInitialPositions: Record<string, Position> = {}
  nodeInitialSizes: Record<string, Size> = {}

  rotates: Record<string, number> = {}

  constructor(options: ITransformOptions) {
    this.engine = options.engine
    this.operation = options.operation
    makeObservable(this, {
      dragging: observable,
      nodeInitialPositions: observable,
      dragStart: action.bound,
      dragMove: action.bound,
      dragStop: action.bound,
      triggerDrag: action.bound,
    })
  }

  // Drag related methods
  dragStart(event: DragStartEvent) {
    if (this.operation.selection.selectedNodes.length > 0) {
      if (CornerResizeStyles.includes(this.engine.cursor.type) || EdgeResizeStyles.includes(this.engine.cursor.type)) {
        this.engine.cursor.dragType = CursorDragType.Resize
        this.operation.selection.selectedNodes.forEach(node => {
          this.nodeInitialSizes[node.id] = { ...node.size }
        })

        return
      }
      if (RotateStyles.includes(this.engine.cursor.type)) {
        this.engine.cursor.dragType = CursorDragType.Rotate
        this.operation.selection.selectedNodes.forEach(node => {
          this.rotates[node.id] = node.rotation
        })

        return
      }
      this.engine.cursor.dragType = CursorDragType.Move
      this.nodeInitialPositions = {}
      this.operation.selection.selectedNodes.forEach(node => {
        this.nodeInitialPositions[node.id] = { ...node.position }
      })
    }
  }

  dragMove(event: DragMoveEvent) {
    console.log('dragMove', this.engine.cursor.dragType)
    switch (this.engine.cursor.dragType) {
      case CursorDragType.Move:
        this.handleMove()
        break
      case CursorDragType.Rotate:
        this.handleRotate()
        break
      default:
        break
    }
  }

  dragStop() {
    switch (this.engine.cursor.dragType) {
      case CursorDragType.Move:
        this.handleMoveEnd()
        break
      case CursorDragType.Rotate:
        this.handleRotateEnd()
        break
      default:
        break
    }
  }

  handleMove() {
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

        this.triggerDrag(node, newPosition)
      }
    })
  }

  handleMoveEnd() {
    if (Object.keys(this.nodeInitialPositions).length > 0) {
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

    this.dragging = false
    this.nodeInitialPositions = {}
    this.operation.selection.selectedNodes.forEach(node => {
      this.triggerDragEnd(node)
    })
  }

  handleRotate() {
    if (this.operation.selection.selectedNodes.length > 0) {
      const rect = this.operation.selection.selectedRectPoints
      const center = {
        x: (rect[0].x + rect[2].x) / 2,
        y: (rect[0].y + rect[2].y) / 2,
      }
      const angle = calculateAngleABC(
        { x: this.engine.cursor.dragStartPosition.offsetX, y: this.engine.cursor.dragStartPosition.offsetY },
        center,
        { x: this.engine.cursor.position.offsetX, y: this.engine.cursor.position.offsetY }
      )

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
    }
  }

  handleRotateEnd() {
    if (Object.keys(this.rotates).length > 0) {
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

    this.rotates = {}
    this.operation.selection.selectedNodes.forEach(node => {
      this.triggerDragEnd(node)
    })
  }

  // Event trigger methods
  triggerDrag(node: DNode, position: Position) {
    node.moveTo(position)
    this.engine.events.emit(
      'node:drag',
      new DragNodeEvent({
        source: node,
        position,
      })
    )
  }

  triggerDragEnd(node: DNode) {
    this.engine.events.emit(
      'node:dragEnd',
      new DragNodeEndEvent({
        source: node,
      })
    )
  }

  triggerRotateEnd(nodes: DNode[]) {
    this.engine.events.emit(
      'node:rotateEnd',
      new DragNodeEndEvent({
        source: nodes,
      })
    )
  }

  triggerRotation(node: DNode, rotation: number) {
    node.rotation = rotation
    const event = new RotateNodeEvent({
      source: node,
      rotation,
    })

    this.engine.events.emit(event.type, event)
  }
}
