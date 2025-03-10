import { action, computed, makeObservable, override } from 'mobx'
import { Graphics } from 'pixi.js'

import { Engine } from '../models/Engine'
import { ColorUtils } from '../utils/styles'

import { DVector, IDVectorBase } from './DVector'
import { Color, Position, Size } from './type'

export interface IDRectangleBase extends IDVectorBase {
  size: Size
  cornerRadius?: number
  type: 'RECTANGLE'
}
export class DRectangle extends DVector<Graphics> {
  _cornerRadius: number = 0
  constructor(engine: Engine, options: IDRectangleBase) {
    super(engine, options)
    this._cornerRadius = options.cornerRadius ?? 0
    if (this.fills.length === 0) {
      this.fills.push(DVector.DEFAULT_FILL)
    }
    makeObservable(this, {
      setSize: override,
      update: action.bound,
      cornerRadius: computed,
    })
    this.item = new Graphics()
    this.update()
  }

  get cornerRadius() {
    return this._cornerRadius
  }

  set cornerRadius(value: number) {
    this.setCornerRadius(value)
  }

  containsPoint(point: Position) {
    return this.item.containsPoint(this.item.toLocal(point))
  }

  setCornerRadius(value: number) {
    this._cornerRadius = value
    this.update()
  }

  setSize(size: Size) {
    super.setSize(size)
    this.update()
  }

  update() {
    this.item.clear()
    const position = this.position

    this.item.position.set(position.x, position.y)
    this.item.pivot.set(this.size.width / 2, this.size.height / 2)

    this.item.visible = this.visible
    this.item.rotation = this.rotation
    this.item
      .roundRect(0, 0, this.size.width, this.size.height, this.cornerRadius)
      .fill(ColorUtils.rgbaToNumber(this.fills[0].color ?? (DVector.DEFAULT_FILL.color as Color)))
      .stroke(this.strokes[0])
  }
}
