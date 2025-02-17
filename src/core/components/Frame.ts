import { Application, Container, Graphics } from 'pixi.js'
import { Engine } from '../Engine'

export interface FrameOptions {
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  pivot?: { x: number; y: number }
  app: Application
  engine: Engine
}

export class Frame extends Container {
  app: Application
  engine: Engine
  background: Graphics

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
    this.engine = options.engine

    this.pivot.set(width / 2, height / 2)
    this.background = new Graphics({ x: 0, y: 0 }).rect(0, 0, width, height).fill({ color: 0xffffff })

    this.addChild(this.background)
    this.updateMask()
  }

  get zoomRatio() {
    return Math.min(this.scale.x, this.scale.y)
  }

  set zoomRatio(zoom: number) {
    this.scale.set(zoom)
    // this.updateMask()
  }

  updateMask() {
    const mask = new Graphics({
      x: 0,
      y: 0,
    })
      .rect(0, 0, this.width, this.height)
      .fill({ color: 'green' })

    mask.rotation = this.rotation
    this.addChild(mask)
    this.mask = mask
  }
}

export default Frame
