import { IEngineContext } from '../../types'
import { getKeyCodeFromEvent, KeyCode } from '../../utils/keycode'

export abstract class AbstractKeyboardEvent {
  data: KeyCode
  // context: IEngineContext
  originEvent: KeyboardEvent

  constructor(e: KeyboardEvent) {
    this.data = getKeyCodeFromEvent(e)
    this.originEvent = e
  }

  get eventType() {
    return this.originEvent.type
  }

  get ctrlKey() {
    return this.originEvent.ctrlKey
  }

  get shiftKey() {
    return this.originEvent.shiftKey
  }

  get metaKey() {
    return this.originEvent.metaKey
  }

  get altkey() {
    return this.originEvent.altKey
  }

  preventDefault() {
    this.originEvent.preventDefault()
  }

  stopPropagation() {
    this.originEvent.stopPropagation()
  }
}
