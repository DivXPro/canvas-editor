import { Container, FederatedPointerEvent, Graphics, Point } from 'pixi.js'

import { Engine } from '../models/Engine'
import * as UICfg from '../config'

export class ControlBox extends Container {
  private engine: Engine
  private border: Graphics
  private handles: Graphics[]
  private rotateHandle: Graphics

  constructor(engine: Engine) {
    super()
    this.engine = engine
    this.border = new Graphics()
    this.handles = []
    this.rotateHandle = new Graphics()
    this.visible = false
    this.initBorder()
    this.initHandles()
    this.initRotateHandle()

    this.engine.events.on('element:select', this.handleSelectChange)
    this.engine.events.on('element:unselect', this.handleSelectChange)
    this.engine.events.on('node:transform', this.handleTransformNode)
    this.engine.events.on('zoom:change', this.handleZoomChange)
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

  private initRotateHandle() {
    const radius = UICfg.boundingHandingSize

    this.rotateHandle
      .circle(0, 0, radius)
      .fill({
        color: UICfg.white,
      })
      .stroke({
        width: UICfg.boundingHandingStrokeWidth,
        color: UICfg.boundingHandingStrokeColor,
      })

    this.rotateHandle.eventMode = 'static'
    this.rotateHandle.cursor = 'pointer'
    this.rotateHandle.on('pointerdown', this.handleRotateStart)
    this.addChild(this.rotateHandle)
  }

  private handleRotateStart(event: FederatedPointerEvent) {
    this.engine.workbench?.transformHelper.rotateStart(event)
    event.preventDefault()
    event.stopPropagation()
  }

  private handleRotateMove = (event: FederatedPointerEvent) => {
    // TODO:
  }

  private handleRotateEnd = () => {
    // this.isRotating = false
    // this.last
    // RotatePoint = null
  }

  private handleZoomChange = () => {
    this.update()
  }

  update() {
    if (this.selection == null || this.selection.selected.length === 0) {
      return
    }
    const rect = this.selection?.selectedRectPoints

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

    // 更新旋转控制点位置
    const centerX = (rect[0].x + rect[2].x) / 2
    const centerY = rect[0].y - 30 // 将旋转控制点放在选区上方

    this.rotateHandle.position.set(centerX, centerY)
  }

  get rotationHandlePos() {
    return this.getGlobalPosition(new Point(this.rotateHandle.position.x, this.rotateHandle.position.y))
  }

  private handleTransformNode = () => {
    this.update()
  }

  private handleSelectChange = () => {
    console.log('handleSelectChange')
    if (this.selection == null || this.selection.length === 0) {
      this.hide()
    } else {
      this.show()
    }
  }

  show() {
    console.log('controlbox show')
    this.update()
    this.visible = true
  }

  hide() {
    console.log('controlbox hide')
    this.visible = false
  }

  destroy() {
    this.engine.events.off('element:select', this.handleSelectChange)
    this.engine.events.off('element:unselect', this.handleSelectChange)
    this.parent.removeChild(this)
    super.destroy()
  }
}
