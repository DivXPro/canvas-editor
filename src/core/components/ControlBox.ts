import { Container, Graphics } from 'pixi.js'

import { Engine } from '../models/Engine'
import * as UICfg from '../config'
import { Position } from '../nodes'
import { calculatePointsFromBounds } from '../utils/transform'
import { isPointInPointsArea } from '../utils/hitConfirm'
import { CursorViewOffset } from '../models'

export class ControlBox extends Container {
  engine: Engine
  border: Graphics
  handles: Graphics[]

  constructor(engine: Engine) {
    super()
    this.engine = engine
    this.border = new Graphics()
    this.handles = []
    this.visible = false
    this.initBorder()
    this.initHandles()
  }

  private initBorder() {
    this.addChild(this.border)
  }

  private initHandles() {
    // 4个控制点：左上、右上、右下、左下
    for (let i = 0; i < 4; i++) {
      const handle = new Graphics()
        .rect(0, 0, UICfg.boundingHandingSize, UICfg.boundingHandingSize)
        .fill({
          color: UICfg.white,
        })
        .stroke({
          width: UICfg.boundingHandingStrokeWidth,
          color: UICfg.boundingHandingStrokeColor,
        })

      handle.pivot.set(UICfg.boundingHandingSize / 2, UICfg.boundingHandingSize / 2)
      this.handles.push(handle)
      this.addChild(handle)
    }
  }
  get selection() {
    return this.engine.workbench?.selection
  }

  private handleZoomChange = () => {
    this.update()
  }

  update() {
    if (this.selection == null || this.selection.selected.length === 0) {
      return this.hide()
    }
    const rect = this.selection?.selectedDisplayRectPoints

    if (rect.length === 0) {
      return
    }
    const firstSelected = this.engine.workbench?.findById(this.selection.selected[0])
    const handleRotation = this.selection.selected.length === 1 ? (firstSelected?.rotation ?? 0) : 0

    this.border
      .clear()
      .moveTo(rect[0].x, rect[0].y)
      .lineTo(rect[1].x, rect[1].y)
      .lineTo(rect[2].x, rect[2].y)
      .lineTo(rect[3].x, rect[3].y)
      .lineTo(rect[0].x, rect[0].y)
      .closePath()
      .stroke({ color: UICfg.primaryColor, width: UICfg.boundingBoxWidth })

    this.handles.forEach((handle, i) => {
      handle.rotation = handleRotation
      handle.position.set(rect[i].x, rect[i].y)
    })
    this.show()
  }

  show() {
    this.engine.events.on('zoom:change', this.handleZoomChange)
    this.visible = true
  }

  hide() {
    this.engine.events.off('zoom:change', this.handleZoomChange)
    this.visible = false
  }

  isOnTransformArea(checkPoint: Position) {
    for (let i = 0; i < this.handles.length; i++) {
      const handle = this.handles[i]
      const point = handle.toLocal({ x: checkPoint.x + CursorViewOffset, y: checkPoint.y + CursorViewOffset })

      if (this.isLocalPointOnHandler(point, i)) {
        return true
      }
      if (this.isLocalPointOnRotateHandler(point, i)) {
        return true
      }
    }

    if (
      this.isPointOnHorizontalBorder({
        x: checkPoint.x + CursorViewOffset * 1.5,
        y: checkPoint.y + CursorViewOffset * 1.5,
      })
    ) {
      return true
    }

    if (
      this.isPointOnVerticalBorder({
        x: checkPoint.x + CursorViewOffset * 1.5,
        y: checkPoint.y + CursorViewOffset * 1.5,
      })
    ) {
      return true
    }

    return false
  }

  isPointOnHandler(point: Position, handleIndex?: number) {
    if (handleIndex == null) {
      return this.handles.some(handle => handle.containsPoint(handle.toLocal(point)))
    }

    return this.handles[handleIndex].containsPoint(this.handles[handleIndex].toLocal(point))
  }

  isLocalPointOnHandler(point: Position, handleIndex?: number) {
    if (handleIndex == null) {
      return this.handles.some(handle => handle.containsPoint(point))
    }

    return this.handles[handleIndex].containsPoint(point)
  }

  isPointOnRotateHandler(point: Position, handleIndex?: number) {
    if (handleIndex == null) {
      return this.handles.some(handle => {
        const bounds = handle.getLocalBounds().clone()

        if (handleIndex === 0 || handleIndex === 3) {
          bounds.minX -= 10
        } else {
          bounds.maxX += 10
        }

        if (handleIndex === 0 || handleIndex === 1) {
          bounds.minY -= 10
        } else {
          bounds.maxY += 10
        }

        return isPointInPointsArea(handle.toLocal(point), calculatePointsFromBounds(bounds))
      })
    }
    const bounds = this.handles[handleIndex].getLocalBounds().clone()

    if (handleIndex === 0 || handleIndex === 3) {
      bounds.minX -= 10
    } else {
      bounds.maxX += 10
    }

    if (handleIndex === 0 || handleIndex === 1) {
      bounds.minY -= 10
    } else {
      bounds.maxY += 10
    }

    return isPointInPointsArea(this.handles[handleIndex].toLocal(point), calculatePointsFromBounds(bounds))
  }

  isLocalPointOnRotateHandler(point: Position, handleIndex?: number) {
    if (handleIndex == null) {
      return this.handles.some(handle => {
        const bounds = handle.getLocalBounds().clone()

        if (handleIndex === 0 || handleIndex === 3) {
          bounds.minX -= 10
        } else {
          bounds.maxX += 10
        }

        if (handleIndex === 0 || handleIndex === 1) {
          bounds.minY -= 10
        } else {
          bounds.maxY += 10
        }

        return isPointInPointsArea(point, calculatePointsFromBounds(bounds))
      })
    }
    const bounds = this.handles[handleIndex].getLocalBounds().clone()

    if (handleIndex === 0 || handleIndex === 3) {
      bounds.minX -= 10
    } else {
      bounds.maxX += 10
    }

    if (handleIndex === 0 || handleIndex === 1) {
      bounds.minY -= 10
    } else {
      bounds.maxY += 10
    }

    return isPointInPointsArea(point, calculatePointsFromBounds(bounds))
  }

  isPointOnBorder(point: Position, borderWidth: number = 8): boolean {
    if (!this.selection || this.selection.selected.length === 0) {
      return false
    }

    // 检查水平线
    if (this.isPointOnHorizontalBorder(point, borderWidth)) {
      return true
    }

    // 检查垂直线
    if (this.isPointOnVerticalBorder(point, borderWidth)) {
      return true
    }

    return false
  }

  isPointOnHorizontalBorder(point: Position, borderWidth: number = 8): boolean {
    const rect = this.selection.selectedDisplayRectPoints

    // 检查上边框
    if (this.isPointOnLine(point, rect[0], rect[1], borderWidth)) {
      return true
    }

    // 检查下边框
    if (this.isPointOnLine(point, rect[3], rect[2], borderWidth)) {
      return true
    }

    return false
  }

  isPointOnVerticalBorder(point: Position, borderWidth: number = 8): boolean {
    const rect = this.selection.selectedDisplayRectPoints

    // 检查左边框
    if (this.isPointOnLine(point, rect[0], rect[3], borderWidth)) {
      return true
    }

    // 检查右边框
    if (this.isPointOnLine(point, rect[1], rect[2], borderWidth)) {
      return true
    }

    return false
  }

  private isPointOnLine(p: Position, start: Position, end: Position, halfWidth: number): boolean {
    const A = p.x - start.x
    const B = p.y - start.y
    const C = end.x - start.x
    const D = end.y - start.y

    const dot = A * C + B * D
    const lenSq = C * C + D * D

    let param = -1

    if (lenSq !== 0) {
      param = dot / lenSq
    }

    let xx, yy

    if (param < 0) {
      xx = start.x
      yy = start.y
    } else if (param > 1) {
      xx = end.x
      yy = end.y
    } else {
      xx = start.x + param * C
      yy = start.y + param * D
    }

    const dx = p.x - xx
    const dy = p.y - yy
    const distance = Math.sqrt(dx * dx + dy * dy)

    return distance <= halfWidth
  }

  destroy() {
    this.parent.removeChild(this)
    super.destroy()
  }
}
