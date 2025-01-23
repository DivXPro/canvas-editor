import { PointerMoveEvent } from '../events'

import { EventDriver } from './EventDriver'

export class PointerMoveDriver extends EventDriver {
  private request?: number

  onPointerMove = (e: PointerEvent) => {
    this.request = requestAnimationFrame(() => {
      this.request != null && cancelAnimationFrame(this.request)
      const event = new PointerMoveEvent({
        clientX: e.clientX,
        clientY: e.clientY,
        pageX: e.pageX,
        pageY: e.pageY,
        target: e.target,
        view: e.view,
      })

      this.events.emit(event.type, event)
    })
  }

  attach() {
    this.addEventListener('pointermove', this.onPointerMove.bind(this), {
      passive: false,
    })
  }

  detach() {
    this.removeEventListener('pointermove', this.onPointerMove.bind(this))
  }
}
