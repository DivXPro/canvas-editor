import { Container, Graphics, Point } from 'pixi.js'

import { DElement } from './elements/DElement'
import * as UICfg from './config'

export class BoundingBox extends Container {
  private element: DElement
  private border: Graphics
  private handles: Graphics[]

  constructor(element: DElement) {
    super({ x: element.centerX, y: element.centerY })
    this.element = element
    this.border = new Graphics()
    this.handles = []
    this.init()
  }

  private init() {
    this.initBorder()
    this.initHandles()
    this.update()
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
    this.handlePostions.forEach(pos => {
      const handle = new Graphics()
        .rect(pos.x, pos.y, UICfg.boundingHandingSize, UICfg.boundingHandingSize)
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
    // 更新边框
    this.border.clear()
    this.border.setStrokeStyle({
      width: UICfg.boundingBoxWidth,
      color: UICfg.boudingBoxColor,
    })
    this.border.rect(
      this.element.centerX - this.element.width / 2,
      this.element.centerY - this.element.height / 2,
      this.element.width,
      this.element.height
    )
    this.border.stroke()

    // 更新控制点位置
    this.handles.forEach((handle, index) => {
      handle.position.set(this.handlePostions[index].x, this.handlePostions[index].y)
    })

    if (this.parent == null) {
      this.element.app.boundingLayer?.addChild(this)
    }
  }

  public show() {
    console.log('show bounding box')
    this.update()
    this.visible = true
  }

  public hide() {
    console.log('hide bounding box')
    this.visible = false
  }

  private get handlePostions() {
    return [
      new Point(this.element.centerX - this.element.width / 2, this.element.centerY - this.element.height / 2),
      new Point(this.element.centerX + this.element.width / 2, this.element.centerY - this.element.height / 2),
      new Point(this.element.centerX + this.element.width / 2, this.element.centerY + this.element.height / 2),
      new Point(this.element.centerX - this.element.width / 2, this.element.centerY + this.element.height / 2),
    ]
  }
}
