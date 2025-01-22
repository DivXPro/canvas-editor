import { Container, Graphics, Point } from 'pixi.js'

import { IDElementInstance } from './elements/DElement'

export class BoundingBox {
  private item: IDElementInstance<any>
  private container: Container
  private border: Graphics
  private handles: Graphics[]
  private rotationHandle: Graphics

  constructor(item: IDElementInstance<any>) {
    this.item = item
    this.container = new Container()
    this.border = new Graphics()
    this.handles = []
    this.rotationHandle = new Graphics()

    this.init()
  }

  private init() {
    this.initBorder()
    this.initHandles()
    this.initRotationHandle()
    this.update()
  }

  private initBorder() {
    this.border.setStrokeStyle({
      width: 1,
      color: 0x0099ff,
    })
    this.container.addChild(this.border)
  }

  private initHandles() {
    // 4个控制点：左上、右上、右下、左下
    const positions = [
      new Point(-0.5, -0.5),
      new Point(0.5, -0.5),
      new Point(0.5, 0.5),
      new Point(-0.5, 0.5),
    ]

    positions.forEach(pos => {
      const handle = new Graphics()

      handle.setFillStyle({
        color: 0xffffff,
      })
      handle.setStrokeStyle({
        width: 1,
        color: 0x0099ff,
      })
      handle.rect(-4, -4, 8, 8)
      handle.fill()
      handle.stroke()
      this.handles.push(handle)
      this.container.addChild(handle)
    })
  }

  private initRotationHandle() {
    this.rotationHandle.setFillStyle({
      color: 0xffffff,
    })
    this.rotationHandle.setStrokeStyle({
      width: 1,
      color: 0x0099ff,
    })
    this.rotationHandle.circle(0, 0, 4)
    this.rotationHandle.fill()
    this.rotationHandle.stroke()
    this.container.addChild(this.rotationHandle)
  }

  public update() {
    // 更新边框
    this.border.clear()
    this.border.setStrokeStyle({
      width: 1,
      color: 0x0099ff
    })
    this.border.rect(
      this.item.x,
      this.item.y,
      this.item.width,
      this.item.height
    )
    this.border.stroke()

    // 更新控制点位置
    this.handles.forEach((handle, index) => {
      const x = this.item.x + this.item.width * (index % 2)
      const y = this.item.y + this.item.height * Math.floor(index / 2)

      handle.position.set(x, y)
    })

    // 更新旋转控制点位置
    this.rotationHandle.position.set(
      this.item.x + this.item.width / 2,
      this.item.y - 20
    )
  }

  public show() {
    this.container.visible = true
    this.update()
  }

  public hide() {
    this.container.visible = false
  }

  public destroy() {
    this.container.destroy()
  }

  public getContainer() {
    return this.container
  }
}
