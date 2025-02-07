import { TextString, TextStyleOptions } from 'pixi.js'
import { action, makeObservable, override } from 'mobx'

import { Engine } from '../Engine'
import { TextBox } from '../components/TextBox'

import { DElement, IDElement, IDElementInstance } from './DElement'

export interface IDText extends IDElement {
  fixSize?: boolean
  text?: TextString
  style?: TextStyleOptions
}

export interface DTextOptions extends IDText {
  engine: Engine
  parent?: DElement
}

export class DText extends DElement implements IDElementInstance<TextBox> {
  item: TextBox

  constructor(options: DTextOptions) {
    super(options)
    makeObservable(this, {
      type: override,
      jsonData: override,
      displayName: override,
      width: override,
      centerX: override,
      centerY: override,
      globalCenter: override,
      setWidth: action.bound,
      setHeight: action.bound,
    })
    const { parent: _, ...others } = options

    this.item = new TextBox(others)
    this.setupInteractive()
  }

  get type() {
    return 'Text'
  }

  get displayName() {
    return this.name ?? 'Text'
  }

  get centerX() {
    return (this.item?.x ?? 0) + this.width / 2
  }

  get centerY() {
    return (this.item?.y ?? 0) + this.height / 2
  }

  get globalCenter() {
    return {
      x: this.globalPosition.x + this.displayWidth / 2,
      y: this.globalPosition.y + this.displayHeight / 2,
    }
  }

  get width() {
    if (this.item) {
      return this.item.fixSize ? this.item.fixWidth : this.item.width
    }

    return 0
  }

  get height() {
    if (this.item) {
      return this.item.fixSize ? this.item.fixHeight : this.item.height
    }

    return 0
  }

  setWidth(value: number) {
    if (this.item.fixSize) {
      this.item.fixWidth = value
    } else {
      this.item.width = value
    }
    this.item.fixWidth = value
  }

  setHeight(value: number) {
    if (this.item.fixSize) {
      this.item.fixHeight = value
    } else {
      this.item.height = value
    }
  }

  get jsonData(): IDText {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      rotation: this.rotation,
      text: this.item.text,
      locked: this.locked,
      hidden: this.hidden,
      style: this.item.style,
    }
  }
}
