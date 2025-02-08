import { DNode } from '../../elements'
import { globalThisPolyfill } from '../../utils/globalThisPolyfill'

export interface Position {
  clientX: number
  clientY: number
  pageX: number
  pageY: number
  canvasX: number
  canvasY: number
}

export interface ICursorEventData extends Position {
  target: DNode | any
  view?: Window
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
      canvasX: 0,
      canvasY: 0,
      target: null,
      view: globalThisPolyfill,
    }
  }
}
