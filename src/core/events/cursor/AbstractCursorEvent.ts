import { DNode } from '../../elements'
import { globalThisPolyfill } from '../../utils/globalThisPolyfill'

export interface Position {
  clientX: number
  clientY: number
  pageX: number
  pageY: number
  offsetX: number
  offsetY: number
}

export interface ICursorEventData extends Position {
  target: DNode | any
  view?: Window | null
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
      offsetX: 0,
      offsetY: 0,
      target: null,
      view: globalThisPolyfill,
    }
  }
}
