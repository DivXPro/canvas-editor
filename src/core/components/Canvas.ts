import { Application, ApplicationOptions } from 'pixi.js'

import { CursorType } from '../models'

export type CursorStyle = {
  url: string
  offset: { x: number; y: number }
}
export type CursorStyles = Record<CursorType, CursorStyle>

export interface CanvasAppOptions extends Partial<ApplicationOptions> {
  cursorStyles: CursorStyles
}

export class CanvasApp extends Application {
  cursorStyles: CursorStyles = {
    [CursorType.Default]: { url: 'cursor/Arrow.png', offset: { x: 5, y: 5 } },
    [CursorType.Pointer]: { url: 'cursor/Arrow.png', offset: { x: 5, y: 5 } },
    [CursorType.Move]: { url: 'cursor/Move.png', offset: { x: 0, y: 0 } },
    [CursorType.Text]: { url: 'cursor/Text.png', offset: { x: 0, y: 0 } },
    [CursorType.NotAllowed]: { url: 'cursor/more/NotAllowed.png', offset: { x: 5, y: 5 } },
    [CursorType.EwResize]: { url: 'cursor/resize/EastWest.png', offset: { x: 5, y: 5 } },
    [CursorType.NsResize]: { url: 'cursor/resize/NorthSouth.png', offset: { x: 5, y: 5 } },
    [CursorType.NeswResize]: { url: 'cursor/resize/NorthEastSouthWest.png', offset: { x: 5, y: 7 } },
    [CursorType.NwseResize]: { url: 'cursor/resize/NorthWestSouthEast.png', offset: { x: 5, y: 7 } },
    [CursorType.TlRotate]: { url: 'cursor/rotate/TopLeft.png', offset: { x: 5, y: 5 } },
    [CursorType.TrRotate]: { url: 'cursor/rotate/TopRight.png', offset: { x: 5, y: 5 } },
    [CursorType.BrRotate]: { url: 'cursor/rotate/BottomRight.png', offset: { x: 5, y: 5 } },
    [CursorType.BlRotate]: { url: 'cursor/rotate/BottomLeft.png', offset: { x: 5, y: 5 } },
  }

  constructor() {
    super()
  }

  async init(options?: Partial<CanvasAppOptions>) {
    await super.init(options)
    if (options) {
      this.cursorStyles = options.cursorStyles ?? this.cursorStyles
    }
  }

  getCursorStyle(type: CursorType) {
    return this.cursorStyles[type]
      ? `url('${this.cursorStyles[type].url}') ${this.cursorStyles[type].offset.x} ${this.cursorStyles[type].offset.y}, auto`
      : null
  }
}
