import { Application, Container, Graphics } from 'pixi.js'

export interface FrameOptions {
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  pivot?: { x: number; y: number }
  app: Application
}

export class Frame extends Container {
  app: Application
  background: Graphics
  maskGraphic?: Graphics

  constructor(options: FrameOptions) {
    let { x, y, width, height, rotation } = options

    super({
      x,
      y,
      width,
      height,
      rotation,
    })

    this.app = options.app
    this.background = new Graphics({ x: 0, y: 0 })
      .rect(0, 0, width, height)
      .fill({ color: 0xffffff })

    this.addChild(this.background)
    this.makeMask()
  }

  get zoomRatio() {
    return Math.min(this.scale.x, this.scale.y)
  }

  set zoomRatio(zoom: number) {
    this.scale.set(zoom)
    this.makeMask()
  }

  makeMask() {
    if (this.maskGraphic instanceof Container) {
      this.removeChild(this.maskGraphic)
    }
    const mask = new Graphics({
      x: this.x,
      y: this.y,
    })
      .rect(0, 0, this.width / this.scale.x, this.height / this.scale.y)
      .fill({ color: 'green' })

    mask.rotation = this.rotation
    this.mask = mask
    this.maskGraphic = this.addChildAt(mask, 0)
  }
}

export default Frame
