import { DGraphics, DGraphicsOptions, IDGraphics } from './DGraphics'

export interface IEllipse extends IDGraphics { }

export interface DEllipseOptions extends DGraphicsOptions, IEllipse { }

export class DEllipse extends DGraphics {
  constructor(options: DEllipseOptions) {
    super(options)
    const { width: radiusX, height: radiusY, fillStyle, strokeStyle } = options

    this.item.ellipse(0, 0, radiusX, radiusY).fill(fillStyle).stroke(strokeStyle)
    this.item.visible = this.hidden ? false : true
  }

  get type() {
    return 'Ellipse'
  }

  get jsonData(): IEllipse {
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
