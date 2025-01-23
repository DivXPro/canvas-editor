import { globalThisPolyfill } from '../../utils/globalThisPolyfill'

export interface Position {
  clientX: number
  clientY: number
  topClientX: number
  topClientY: number
  pageX: number
  pageY: number
  topPageX: number
  topPageY: number
  canvasX: number
  canvasY: number
}

export interface ICursorEventData extends Partial<Position> {
  target: EventTarget | null
  view: Window | null
}

export class AbstractCursorEvent {
  data: ICursorEventData

  context: any

  constructor(data: ICursorEventData) {
    this.data = data || {
      clientX: 0,
      clientY: 0,
      pageX: 0,
      pageY: 0,
      target: null,
      view: globalThisPolyfill,
    }
    this.transformCoordinates()
  }

  transformCoordinates() {
    const { frameElement } = this.data?.view || {}

    if (frameElement && this.data.view !== globalThisPolyfill) {
      const frameRect = frameElement.getBoundingClientRect()
      // const scale = frameRect.width / frameElement['offsetWidth']

      this.data.topClientX = this.data.clientX ?? 0 + frameRect.x
      this.data.topClientY = this.data.clientY ?? 0 + frameRect.y
      this.data.topPageX = (this.data.pageX ?? 0) + frameRect.x - (this.data.view?.scrollX ?? 0)
      this.data.topPageY = this.data.pageY ?? 0 + frameRect.y - (this.data.view?.scrollY ?? 0)
      // const topElement = document.elementFromPoint(this.data.topPageX, this.data.topClientY)
    } else {
      this.data.topClientX = this.data.clientX
      this.data.topClientY = this.data.clientY
      this.data.topPageX = this.data.pageX
      this.data.topPageY = this.data.pageY
    }
  }
}
