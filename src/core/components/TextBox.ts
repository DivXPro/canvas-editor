import { Text, TextOptions } from 'pixi.js'

import { Size, Vector2 } from '../elements/type'

export interface TextBoxOptions extends TextOptions {
  size?: Size
}

export class TextBox extends Text {
  _boxPostion: Vector2
  fixWidth?: number
  fixHeight?: number

  constructor(options: TextBoxOptions) {
    const { size, ...rest } = options

    super(rest)
    this._boxPostion = options.position ?? { x: 0, y: 0 }
    this.anchor.set(0.5, 0.5)
    this.fixWidth = size?.width
    this.fixHeight = size?.height
    this.update()
  }

  get fixSize() {
    return this.fixWidth != null && this.fixHeight != null
  }

  get boxPostion() {
    return this._boxPostion
  }

  set boxPostion(value: Vector2) {
    this._boxPostion = value
    this.position.set(value.x, value.y)
    this.update()
  }

  update() {
    if (this.fixSize && this.fixWidth) {
      this.style.wordWrap = this.fixSize
      this.style.wordWrapWidth = this.fixWidth
    }
    this.position.set(this.x + this.width / 2, this.y + this.height / 2)
    if (this.fixWidth && this.width < this.fixWidth) {
      switch (this.style.align) {
        case 'center':
          this.x = this.x + (this.fixWidth - this.width) / 2
          break
        case 'right':
          this.x = this.x + (this.fixWidth - this.width)
          break
        default:
          break
      }
    }
  }
}
