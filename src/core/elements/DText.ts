import { action, computed, makeObservable, override } from 'mobx'

import { Engine } from '../Engine'
import { TextBox } from '../components/TextBox'

import { IDNode } from './DNode'
import { Text } from './type'
import { DVector } from './DVector'
import { DFrameBase } from './DFrameBase'

export interface IDTextBase extends Text {
  type: 'TEXT'
}

export type TDText = IDNode<TextBox> & IDTextBase

export interface DTextOptions extends IDTextBase {
  engine: Engine
  parent?: DFrameBase
}

export class DText extends DVector<TextBox> implements TDText {
  declare type: 'TEXT'
  style: any // 添加缺失的属性
  characterStyleOverrides: any // 添加缺失的属性
  styleOverrideTable: any // 添加缺失的属性
  _characters: string = ''

  constructor(options: DTextOptions) {
    super(options)
    this._characters = options.characters
    this.item = new TextBox({
      text: this.characters,
      position: this.position,
      size: this._size,
      rotation: this.rotation,
    })
    makeObservable(this, {
      size: override,
      jsonData: override,
      globalCenter: override,
      absoluteBoundingBox: override,
      characters: computed,
      displayWidth: override,
      displayHeight: override,
      setPosition: override,
      setWidth: action.bound,
      setHeight: action.bound,
    })
    this.initInteractive()
  }

  get displayWidth() {
    if (this.item) {
      return (this.item.fixWidth ?? this.item.width) * this.engine.zoomRatio
    }

    return 0
  }

  get displayHeight() {
    if (this.item) {
      return (this.item.fixHeight ?? this.item.height) * this.engine.zoomRatio
    }

    return 0
  }

  // get globalCenter() {
  //   if (this.item == null) {
  //     return super.globalCenter
  //   }

  //   return {
  //     x: this.globalPosition.x,
  //     y:
  //       this.globalPosition.y -
  //       (this.item.fixSize && this.item.fixHeight != null ? (this.item.height - this.item.fixHeight) / 2 : 0),
  //   }
  // }

  get characters() {
    return this._characters
  }

  get width() {
    if (this.item) {
      return this.item.fixWidth ?? this.item.width
    }

    return 0
  }

  get height() {
    if (this.item) {
      return this.item.fixHeight ?? this.item.height
    }

    return 0
  }

  get size() {
    return { width: this.width, height: this.height }
  }

  setPosition(x: number, y: number) {
    this._position = { x, y }
    if (this.root) {
      const pos = this.root.tansformRoot2Local({ x, y })

      this.item.boxPosition = { x: pos.x, y: pos.y }
    } else {
      this.item.boxPosition = { x, y }
    }
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

  get jsonData() {
    return {
      ...super.jsonData,
      contr: this.item.text,
      style: this.item.style,
    }
  }
}
