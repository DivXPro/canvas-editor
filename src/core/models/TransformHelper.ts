import { action, makeObservable, observable } from 'mobx'

import { DNode } from '../elements'
import { Position, ResizeHandle, Size } from '../elements/type'
import { DragMoveEvent, DragStartEvent } from '../events'
import {
  DragNodeEndEvent,
  DragNodeEvent,
  ResizeNodeEndEvent,
  ResizeNodeEvent,
  RotateNodeEvent,
} from '../events/mutation/TransformNodeEvent'
import { calculateAngleABC } from '../utils/transform'
import { CompositeCommand, MoveCommand, ResizeCommand, RotationCommand } from '../commands'
import { calculatePointToLineDistance } from '../utils/geometric'

import { Engine } from './Engine'
import { Workbench } from './Workbench'
import { CornerResizeStyles, CursorDragType, CursorType, EdgeResizeStyles, RotateStyles } from './Cursor'

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
  resizeHandle: ResizeHandle | null = null
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
        const cursorType = this.engine.cursor.type

        const cursorPos = { x: this.engine.cursor.position.offsetX, y: this.engine.cursor.position.offsetY }
        const rectPoints = this.operation.selection.selectedRectPoints

        if (cursorType === CursorType.NwseResize) {
          // 计算到左上角和右下角的距离
          const distanceToTopLeft = Math.sqrt(
            Math.pow(cursorPos.x - rectPoints[0].x, 2) + Math.pow(cursorPos.y - rectPoints[0].y, 2)
          )
          const distanceToBottomRight = Math.sqrt(
            Math.pow(cursorPos.x - rectPoints[2].x, 2) + Math.pow(cursorPos.y - rectPoints[2].y, 2)
          )

          this.resizeHandle =
            distanceToTopLeft < distanceToBottomRight ? ResizeHandle.TopLeft : ResizeHandle.BottomRight
        } else if (cursorType === CursorType.NeswResize) {
          // 计算到右上角和左下角的距离
          const distanceToTopRight = Math.sqrt(
            Math.pow(cursorPos.x - rectPoints[1].x, 2) + Math.pow(cursorPos.y - rectPoints[1].y, 2)
          )
          const distanceToBottomLeft = Math.sqrt(
            Math.pow(cursorPos.x - rectPoints[3].x, 2) + Math.pow(cursorPos.y - rectPoints[3].y, 2)
          )

          this.resizeHandle =
            distanceToTopRight < distanceToBottomLeft ? ResizeHandle.TopRight : ResizeHandle.BottomLeft
        } else if (cursorType === CursorType.NsResize) {
          // 计算到上边和下边的距离
          const distanceToTop = calculatePointToLineDistance(cursorPos, rectPoints[0], rectPoints[1])
          const distanceToBottom = calculatePointToLineDistance(cursorPos, rectPoints[2], rectPoints[3])

          this.resizeHandle = distanceToTop < distanceToBottom ? ResizeHandle.Top : ResizeHandle.Bottom
        } else if (cursorType === CursorType.EwResize) {
          // 计算到左边和右边的距离
          const distanceToLeft = calculatePointToLineDistance(cursorPos, rectPoints[0], rectPoints[3])
          const distanceToRight = calculatePointToLineDistance(cursorPos, rectPoints[1], rectPoints[2])

          this.resizeHandle = distanceToLeft < distanceToRight ? ResizeHandle.Left : ResizeHandle.Right
        }

        this.operation.selection.selectedNodes.forEach(node => {
          this.nodeInitialSizes[node.id] = { ...node.size }
          this.nodeInitialPositions[node.id] = { ...node.position }
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
    if (this.operation.selection.selectedNodes.length > 0 && this.engine.cursor.dragType !== CursorDragType.Selection) {
      switch (this.engine.cursor.dragType) {
        case CursorDragType.Move:
          this.handleMove()
          break
        case CursorDragType.Rotate:
          this.handleRotate()
          break
        case CursorDragType.Resize:
          this.handleResize()
          break
        default:
          break
      }
    }
  }

  dragStop() {
    if (this.operation.selection.selectedNodes.length > 0 && this.engine.cursor.dragType !== CursorDragType.Selection) {
      switch (this.engine.cursor.dragType) {
        case CursorDragType.Move:
          this.handleMoveEnd()
          break
        case CursorDragType.Rotate:
          this.handleRotateEnd()
          break
        case CursorDragType.Resize:
          this.handleResizeEnd()
          break
        default:
          break
      }
      this.engine.cursor.dragType = CursorDragType.None
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

  handleResize() {
    const delta = this.engine.cursor.dragStartToCurrentDelta

    if (this.resizeHandle == null) return

    this.operation.selection.selectedNodes.forEach(node => {
      if (!node.locked) {
        const initialSize = this.nodeInitialSizes[node.id]

        if (!initialSize || !this.resizeHandle) return
        const newSize = {
          width: initialSize.width,
          height: initialSize.height,
        }

        // 考虑节点的旋转角度
        const rotation = node.rotation
        const cos = Math.cos(rotation)
        const sin = Math.sin(rotation)

        // 根据旋转角度转换鼠标移动的偏移量
        const transformedDelta = {
          x: delta.offsetX * cos + delta.offsetY * sin,
          y: -delta.offsetX * sin + delta.offsetY * cos,
        }

        if (this.resizeHandle === ResizeHandle.Left || this.resizeHandle === ResizeHandle.Right) {
          newSize.width += this.resizeHandle === ResizeHandle.Left ? -transformedDelta.x : transformedDelta.x
        } else if (this.resizeHandle === ResizeHandle.Top || this.resizeHandle === ResizeHandle.Bottom) {
          newSize.height += this.resizeHandle === ResizeHandle.Top ? -transformedDelta.y : transformedDelta.y
        } else {
          newSize.width +=
            this.resizeHandle === ResizeHandle.TopLeft || this.resizeHandle === ResizeHandle.BottomLeft
              ? -transformedDelta.x
              : transformedDelta.x
          newSize.height +=
            this.resizeHandle === ResizeHandle.TopLeft || this.resizeHandle === ResizeHandle.TopRight
              ? -transformedDelta.y
              : transformedDelta.y
        }

        this.triggerResize(node, this.resizeHandle, newSize)
      }
    })
  }

  handleResizeEnd() {
    if (Object.keys(this.nodeInitialSizes).length > 0) {
      if (this.resizeHandle == null) return

      const compositeCommand = new CompositeCommand({
        timestamp: Date.now(),
      })

      this.operation.selection.selectedNodes.forEach(node => {
        if (!node.locked) {
          const initialSize = this.nodeInitialSizes[node.id]

          if (!initialSize || !this.resizeHandle) return

          this.triggerResizeEnd(node, this.resizeHandle, node.size)

          const resizeCommand = new ResizeCommand(
            node,
            this.engine,
            { size: node.size, handle: this.resizeHandle },
            { size: this.nodeInitialSizes[node.id], handle: this.resizeHandle }
          )

          compositeCommand.add(resizeCommand)
        }
      })
      this.operation.history.push(compositeCommand)
      this.nodeInitialSizes = {}
      this.resizeHandle = null
    }
  }

  triggerResize(node: DNode, handle: ResizeHandle, size: Size) {
    node.resize(handle, size)
    this.engine.events.emit(
      'node:resize',
      new ResizeNodeEvent({
        source: node,
        handle,
        size,
      })
    )
  }

  triggerResizeEnd(node: DNode, handle: ResizeHandle, size: Size) {
    this.engine.events.emit(
      'node:resizeEnd',
      new ResizeNodeEndEvent({
        source: node,
        handle,
        size,
      })
    )
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
