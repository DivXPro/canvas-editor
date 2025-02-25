import { KeyDownEvent, KeyUpEvent } from '../events'

import { EventDriver } from './EventDriver'

export class KeyboardDriver extends EventDriver {
  onKeyDown = (e: KeyboardEvent) => {
    console.log('onKeyDown', e)
    this.engine.dispatch(new KeyDownEvent(e))
  }

  onKeyUp = (e: KeyboardEvent) => {
    this.engine.dispatch(new KeyUpEvent(e))
  }

  attach() {
    document.addEventListener('keydown', this.onKeyDown)
    document.addEventListener('keyup', this.onKeyUp)
  }

  detach() {
    document.removeEventListener('keydown', this.onKeyDown)
    document.removeEventListener('keyup', this.onKeyUp)
  }
}
