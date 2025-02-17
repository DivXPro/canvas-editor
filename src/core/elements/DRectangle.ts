import { computed, makeObservable, override } from 'mobx'
import { Graphics } from 'pixi.js'

import { Engine } from '../models/Engine'
import { ColorUtils } from '../utils/styles'

import { DVector, IDVectorBase } from './DVector'
import { Color, Size } from './type'
import { DFrameBase } from './DFrameBase'

export interface IDRectangleBase extends IDVectorBase {
  size: Size
  cornerRadius?: number
  type: 'RECTANGLE'
}

export interface DRectangleOptions extends IDRectangleBase {
  engine: Engine
  parent?: DFrameBase
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
    // const position =
    //   (this.root === this.parent ? this.position : this.root?.tansformRoot2Local(this.position)) ?? this.position
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

  get size() {
    return this._size
  }

  get jsonData() {
    return {
      ...super.jsonData,
    }
  }
}
