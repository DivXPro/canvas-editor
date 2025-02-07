import { action, computed, makeObservable, observable, override } from 'mobx'
import { FillStyle, Graphics, StrokeStyle } from 'pixi.js'

import { Engine } from '../Engine'

import { DElement, IDElement, IDElementInstance } from './DElement'

export interface GraphicsData {
  data: any
  fillStyle: FillStyle
  strokeStyle: StrokeStyle
}

export interface IDGraphics extends IDElement {
  width: number
  height: number
  fillStyle: FillStyle
  strokeStyle: StrokeStyle
}

export interface DGraphicsOptions extends IDGraphics {
  engine: Engine
  parent?: DElement
}

export abstract class DGraphics extends DElement implements IDElementInstance<Graphics> {
  _width: number
  _height: number
  item: Graphics

  constructor(options: DGraphicsOptions) {
    super(options)
    makeObservable(this, {
      type: override,
      jsonData: override,
      displayName: override,
      width: override,
      setWidth: action.bound,
      setHeight: action.bound,
    })
    this.item = new Graphics({
      x: options.x,
      y: options.y,
      width: options.width,
      height: options.height,
    })
    this._width = options.width
    this._height = options.height
    this.setupInteractive()
  }

  get type() {
    return 'DGraphics'
  }

  get displayName() {
    return this.name ?? 'DGraphics'
  }

  get displayWidth() {
    return this.width * this.engine.zoomRatio
  }

  get displayHeight() {
    return this.height * this.engine.zoomRatio
  }

  get width() {
    return this._width
  }

  set width(value: number) {
    this.setWidth(value)
  }

  setWidth(value: number) {
    this._width = value
  }

  get height() {
    return this._height
  }

  set height(value: number) {
    this.setHeight(value)
  }

  setHeight(value: number) {
    this._height = value
  }

  get jsonData(): IDGraphics {
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
