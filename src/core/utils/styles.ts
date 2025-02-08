import { Color } from '../elements/type'

export class ColorUtils {
  /**
   * 将 Color 对象转换为 0x 形式的数字
   * @param color Color 对象
   * @returns 0x 形式的颜色数字
   */
  static rgbaToNumber(color: Color): number {
    const r = Math.round(color.r * 255)
    const g = Math.round(color.g * 255)
    const b = Math.round(color.b * 255)

    return (r << 16) | (g << 8) | b
  }

  /**
   * 将16进制颜色值转换为 RGBA 对象
   * @param hex 16进制颜色值，支持 #RGB、#RGBA、#RRGGBB、#RRGGBBAA 格式
   * @returns Color 对象
   */
  static hexToRGBA(hex: string): Color {
    // 移除 # 前缀
    hex = hex.replace('#', '')

    // 将 3/4 位颜色值转换为 6/8 位
    if (hex.length === 3 || hex.length === 4) {
      hex = hex
        .split('')
        .map(char => char + char)
        .join('')
    }

    // 解析颜色值
    const r = parseInt(hex.substring(0, 2), 16) / 255
    const g = parseInt(hex.substring(2, 4), 16) / 255
    const b = parseInt(hex.substring(4, 6), 16) / 255
    const a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1

    return { r, g, b, a }
  }

  /**
   * 将 RGBA 对象转换为 16 进制颜色值
   * @param color Color 对象
   * @param withAlpha 是否包含透明度
   * @returns 16进制颜色值
   */
  static rgbaToHex(color: Color, withAlpha: boolean = true): string {
    const r = Math.round(color.r * 255)
      .toString(16)
      .padStart(2, '0')
    const g = Math.round(color.g * 255)
      .toString(16)
      .padStart(2, '0')
    const b = Math.round(color.b * 255)
      .toString(16)
      .padStart(2, '0')
    const a = withAlpha
      ? Math.round(color.a * 255)
        .toString(16)
        .padStart(2, '0')
      : ''

    return `#${r}${g}${b}${a}`
  }

  /**
   * 将数字形式的颜色值转换为 RGBA 对象
   * @param num 0xRRGGBB 形式的颜色值
   * @returns Color 对象
   */
  static numberToRGBA(num: number): Color {
    const r = ((num >> 16) & 0xff) / 255
    const g = ((num >> 8) & 0xff) / 255
    const b = (num & 0xff) / 255

    return { r, g, b, a: 1 }
  }

  /**
   * 将数字形式的颜色值转换为 16 进制颜色值
   * @param num 0xRRGGBB 形式的颜色值
   * @returns 16进制颜色值
   */
  static numberToHex(num: number): string {
    const color = ColorUtils.numberToRGBA(num)

    return ColorUtils.rgbaToHex(color, false)
  }

  /**
   * 将16进制颜色值转换为数字形式
   * @param hex 16进制颜色值，支持 #RGB、#RRGGBB 格式
   * @returns 0xRRGGBB 形式的颜色值
   */
  static hexToNumber(hex: string): number {
    const color = ColorUtils.hexToRGBA(hex)

    return ColorUtils.rgbaToNumber(color)
  }
}
