import { FillStyle, StrokeStyle } from 'pixi.js'

import { DGraphics, DGraphicsOptions } from './DGraphics'

export interface EllipseData {
  data: { x: number, y: number, radiusX: number, radiusY: number }
  fillStyle: FillStyle
  strokeStyle: StrokeStyle
}

export interface DEllipseOptions extends DGraphicsOptions {
  graphics: EllipseData
}

export class DEllipse extends DGraphics {
  constructor(options: DEllipseOptions) {
    super(options)
    const { x, y, radiusX, radiusY } = options.graphics.data

    this.item
      .ellipse(x, y, radiusX, radiusY)
      .fill(options.graphics.fillStyle)
      .stroke(options.graphics.strokeStyle)
    this.item.visible = this.hidden ? false : true
  }

  get type() {
    return 'Ellipse'
  }
}
