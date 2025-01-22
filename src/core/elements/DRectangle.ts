import { FillStyle, StrokeStyle } from 'pixi.js'

import { DesignApplication } from '../DesignApplication'

import { DGraphics } from './DGraphics'
import { IDElement } from './DElement'

export interface DRectangleData {
  data: { x: number, y: number, width: number, height: number, radius?: number }
  fillStyle: FillStyle
  strokeStyle: StrokeStyle
}

export interface IDRectangle extends IDElement {
  radius?: number
  graphics: DRectangleData
}

export interface DRectangleOptions extends IDRectangle {
  app: DesignApplication
}

export class DRectangle extends DGraphics {
  constructor(options: DRectangleOptions) {
    super(options)
    const { width, height, radius } = options
    this.item.roundRect(0, 0, width, height, radius)
      .fill(options.graphics.fillStyle)
      .stroke(options.graphics.strokeStyle)
    this.item.pivot.set(width / 2, height / 2)
    this.item.rotation = options.rotation ?? 0
    this.item.visible = this.hidden ? false : true
    this.renderOutline()
  }

  get type() {
    return 'Rectangle'
  }
}