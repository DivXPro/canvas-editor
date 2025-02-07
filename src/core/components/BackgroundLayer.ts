import { Container, Graphics } from 'pixi.js'

import { Engine } from '../Engine'

interface BackgroundOptions {
  app: Engine
  color?: string | number
}

export class BackgroundLayer extends Container {
  app: Engine
  background: Graphics

  constructor(options: BackgroundOptions) {
    super()
    this.app = options.app
    this.background = new Graphics()
    this.background.rect(0, 0, 0, 0).fill({ color: options.color ?? 0xf9f9f9 })
    this.updateSize()
    this.addChild(this.background)

    this.eventMode = 'static'
    // 监听画布尺寸变化
    this.app.renderer.on('resize', this.updateSize.bind(this))
  }

  updateSize() {
    const { width, height } = this.app.screen

    this.background.position.set(width / 2, height / 2)
    this.background.clear()
    this.background.rect(-width / 2, -height / 2, width, height).fill({ color: this.background.fillStyle.color })
  }

  destroy() {
    this.app.renderer.off('resize', this.updateSize.bind(this))
    super.destroy()
  }
}
