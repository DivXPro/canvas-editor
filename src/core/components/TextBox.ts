import { Text, TextOptions, TextStyleOptions } from 'pixi.js'

export interface TextBoxOptions extends TextOptions {
  fixSize?: boolean
  style?: TextStyleOptions
}

export class TextBox extends Text {
  fixSize?: boolean
  fixWidth: number
  fixHeight: number

  constructor(options: TextBoxOptions) {
    let { fixSize = false, width, height, ...others } = options

    super(others)

    this.fixSize = fixSize
    this.fixWidth = width ?? this.width
    this.fixHeight = height ?? this.height

    this.render()
  }

  render() {
    if (this.fixSize && this.width <= this.fixWidth) {
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
    } else if (this.fixSize && this.width > this.fixWidth) {
      this.style.wordWrap = this.fixSize
      this.style.wordWrapWidth = this.fixWidth
    }
  }
}
