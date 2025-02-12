import { Container, Graphics, Point } from 'pixi.js'

import { DNode } from '../elements/DNode'
import { SelectElementEvent, UnselectElementEvent } from '../events'
import { isArr } from '../utils/types'
import * as UICfg from '../config'

export class BoundingBox extends Container {
  private element: DNode
  private border: Graphics
  private handles: Graphics[]

  constructor(element: DNode) {
    super({ x: element.globalCenter.x, y: element.globalCenter.y })
    this.element = element
    this.border = new Graphics()
    this.handles = []
    this.init()
  }

  private init() {
    this.visible = false
    this.initBorder()
    this.initHandles()
    this.update()
    this.element.engine.events.on('element:select', this.handleSelectEvent.bind(this))
    this.element.engine.events.on('element:unselect', this.handleSelectEvent.bind(this))
    this.element.engine.events.on('drag:move', this.handleDragMoveEvent.bind(this))
  }

  handleDragMoveEvent() {
    this.hide()
  }

  handleSelectEvent(event: SelectElementEvent | UnselectElementEvent) {
    const selected = event.data.source

    if (isArr(selected)) {
      if (selected.includes(this.element)) {
        this.show(true)
      } else {
        this.hide()
      }
    } else {
      if (selected === this.element) {
        this.show(true)
      } else {
        this.hide()
      }
    }
  }

  private initBorder() {
    this.border.setStrokeStyle({
      width: 1,
      color: 0x0099ff,
    })
    this.addChild(this.border)
  }

  private initHandles() {
    // 4个控制点：左上、右上、右下、左下
    this.handlePostions.forEach(() => {
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
    })
  }

  public update() {
    this.position.set(this.element.globalCenter.x, this.element.globalCenter.y)
    this.pivot.set(this.element.displayWidth / 2, this.element.displayHeight / 2)
    this.rotation = this.element.rotation ?? 0
    // 更新边框
    this.border.clear()
    this.border.setStrokeStyle({
      width: UICfg.boundingBoxWidth,
      color: UICfg.boudingBoxColor,
    })
    this.border.rect(0, 0, this.element.displayWidth, this.element.displayHeight).stroke()

    // 更新控制点位置
    this.handles.forEach((handle, index) => {
      handle.position.set(this.handlePostions[index].x, this.handlePostions[index].y)
    })

    if (this.parent == null) {
      this.element.engine.boundingLayer?.addChild(this)
    }
  }

  public show(update?: boolean) {
    if (update) {
      this.update()
    }
    this.visible = true
  }

  public hide() {
    this.visible = false
  }

  private get handlePostions() {
    return [
      new Point(0, 0),
      new Point(this.element.displayWidth, 0),
      new Point(this.element.displayWidth, this.element.displayHeight),
      new Point(0, this.element.displayHeight),
    ]
  }

  destroy() {
    this.parent.removeChild(this)
    super.destroy()
  }
}
