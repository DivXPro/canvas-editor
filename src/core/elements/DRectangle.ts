import { FillStyle, StrokeStyle } from 'pixi.js'

import { Engine } from '../Engine'

import { DGraphics } from './DGraphics'
import { DElement, IDElement } from './DElement'

export interface DRectangleData {
  data: { x: number; y: number; width: number; height: number; radius?: number }
  fillStyle: FillStyle
  strokeStyle: StrokeStyle
}

export interface IDRectangle extends IDElement {
  radius?: number
  width: number
  height: number
  fillStyle: FillStyle
  strokeStyle: StrokeStyle
}

export interface DRectangleOptions extends IDRectangle {
  engine: Engine
  parent?: DElement
}

export class DRectangle extends DGraphics {
  constructor(options: DRectangleOptions) {
    super(options)
    const { width, height, radius } = options

    this.item.roundRect(0, 0, width, height, radius).fill(options.fillStyle).stroke(options.strokeStyle)
    this.item.pivot.set(width / 2, height / 2)
    this.item.rotation = options.rotation ?? 0
    this.item.visible = this.hidden ? false : true
  }

  get type() {
    return 'Rectangle'
  }

  get displayWidth() {
    return this.width * this.engine.zoomRatio
  }

  get displayHeight() {
    return this.height * this.engine.zoomRatio
  }

  get jsonData(): IDRectangle {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      rotation: this.rotation,
      locked: this.locked,
      hidden: this.hidden,
      fillStyle: this.item.fillStyle,
      strokeStyle: this.item.strokeStyle,
    }
  }
}
