import { action, computed, makeObservable, observable } from 'mobx'
import { FillStyle, Graphics, StrokeStyle } from 'pixi.js'

import { DesignApplication } from '../DesignApplication'

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
  app: DesignApplication
}

export abstract class DGraphics extends DElement implements IDElementInstance<Graphics> {
  _width: number
  _height: number
  item: Graphics

  constructor(options: DGraphicsOptions) {
    super(options)
    makeObservable(this, {
      id: observable,
      name: observable,
      index: observable,
      locked: observable,
      isDragging: observable,
      hidden: computed,
      isHovered: computed,
      isSelected: computed,
      type: computed,
      displayName: computed,
      x: computed,
      y: computed,
      globalPosition: computed,
      width: computed,
      height: computed,
      jsonData: computed,
      setWidth: action.bound,
      setHeight: action.bound,
      setHidden: action.bound,
      setIsHovered: action.bound,
      setIsSelected: action.bound,
      setPostion: action.bound,
      handlePointerEnter: action.bound,
      handlePointerLeave: action.bound,
      handlePointerDown: action.bound,
      handleDragStart: action.bound,
      handleDrageMove: action.bound,
      handleDragEnd: action.bound,
    })
    this.item = new Graphics({
      x: options.x,
      y: options.y,
      width: options.width,
      height: options.height,
    })
    this._width = options.width
    this._height = options.height
    this.setupInteractiveEvents()
  }

  get type() {
    return 'DGraphics'
  }

  get displayWidth() {
    return this.item.getBounds().width
  }

  get displayHeight() {
    return this.item.getBounds().height
  }

  get displayName() {
    return this.name ?? 'DGraphics'
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

  get globalPosition() {
    return this.item.getGlobalPosition()
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
