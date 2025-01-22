import { TextString, TextStyleOptions } from 'pixi.js'
import { action, computed, makeObservable, observable } from 'mobx'

import { DesignApplication } from '../DesignApplication'
import { TextBox } from '../TextBox'

import { DElement, IDElement, IDElementInstance } from './DElement'

export interface IDText extends IDElement {
  fixSize?: boolean
  text?: TextString
  style?: TextStyleOptions
}

export interface DTextOptions extends IDText {
  app: DesignApplication
}

export class DText extends DElement implements IDElementInstance<TextBox> {
  item: TextBox

  constructor(options: DTextOptions) {
    super(options)
    makeObservable(this, {
      id: observable,
      name: observable,
      index: observable,
      locked: observable,
      hidden: computed,
      type: computed,
      displayName: computed,
      x: computed,
      y: computed,
      centerX: computed,
      centerY: computed,
      width: computed,
      height: computed,
      rotation: computed,
      globalPosition: computed,
      jsonData: computed,
      setWidth: action.bound,
      setHeight: action.bound,
      setHidden: action.bound,
      setIsHovered: action.bound,
      setIsSelected: action.bound,
      setPostion: action.bound,
      handlePointerLeave: action.bound,
      handlePointerDown: action.bound,
      handleDragStart: action.bound,
      handleDrageMove: action.bound,
      handleDragEnd: action.bound,
    })
    this.item = new TextBox(options)
    this.setupInteractiveEvents()
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

  get width() {
    if (this.item) {
      return this.item.fixSize ? (this.item.fixWidth, this.item.width) : this.item.width
    }

    return 0
  }

  get height() {
    if (this.item) {
      return this.item.fixSize ? (this.item.fixHeight, this.item.height) : this.item.height
    }

    return 0
  }

  setWidth(value: number) {
    this.item.fixWidth = value
  }

  setHeight(value: number) {
    this.item.fixHeight = value
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
