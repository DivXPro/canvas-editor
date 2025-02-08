import { computed, makeObservable, override } from 'mobx'
import { Graphics } from 'pixi.js'

import { Engine } from '../Engine'

import { DVector, IDVectorBase } from './DVector'
import { DNode } from './DNode'
import { Color, Size } from './type'
import { ColorUtils } from '../utils/styles'

export interface IDRectangleBase extends IDVectorBase {
  size: Size
  cornerRadius?: number
  type: 'RECTANGLE'
}

export interface DRectangleOptions extends IDRectangleBase {
  engine: Engine
  parent?: DNode
}

export class DRectangle extends DVector<Graphics> {
  _cornerRadius: number = 0
  constructor(options: DRectangleOptions) {
    super(options)
    this._cornerRadius = options.cornerRadius ?? 0
    if (this.fills.length === 0) {
      this.fills.push(DVector.DEFAULT_FILL)
    }
    makeObservable(this, {
      size: override,
      absoluteBoundingBox: override,
      cornerRadius: computed,
    })
    this.item = new Graphics()
    this.update()
    this.initInteractive()
  }

  get cornerRadius() {
    return this._cornerRadius
  }

  set cornerRadius(value: number) {
    this.setCornerRadius(value)
  }

  setCornerRadius(value: number) {
    this._cornerRadius = value
    this.update()
  }

  private update() {
    this.item.clear()
    this.item.position.set(this.position.x, this.position.y)
    this.item.visible = this.visible
    this.item.pivot.set(0, 0)
    this.item.rotation = this.rotation
    this.item
      .roundRect(-this.size.width / 2, -this.size.height / 2, this.size.width, this.size.height, this.cornerRadius)
      .fill(ColorUtils.rgbaToNumber(this.fills[0].color ?? (DVector.DEFAULT_FILL.color as Color)))
      .stroke(this.strokes[0])
  }

  get size() {
    return this._size
  }

  get absoluteBoundingBox() {
    const bounds = this.item.getBounds()

    return {
      x: bounds.minX,
      y: bounds.minY,
      width: bounds.width,
      height: bounds.height,
    }
  }

  get jsonData() {
    return {
      ...super.jsonData,
    }
  }
}
