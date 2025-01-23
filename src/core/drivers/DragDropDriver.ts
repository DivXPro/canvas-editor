import { DragStartEvent } from '../events'

import { EventDriver } from './EventDriver'

const GlobalState = {
  isDragging: false,
  onPointerDownAt: 0,
  startEvent: null,
  moveEvent: null,
}

export class DragDropDriver extends EventDriver {
  private handlePointerDown(event: PointerEvent) {
    GlobalState.isDragging = false

    const dragStartEvent = new DragStartEvent({
      clientX: event.clientX,
      clientY: event.clientY,
      pageX: event.pageX,
      pageY: event.pageY,
      target: event.target,
      view: event.view,
    })

    this.events.emit(dragStartEvent.type, dragStartEvent)
  }

  private handlePointerMove(event: PointerEvent) {
    if (!GlobalState.isDragging) return

    this.events.emit('drag', event)
  }

  private handlePointerUp(event: PointerEvent) {
    if (!GlobalState.isDragging) return

    GlobalState.isDragging = false
    this.events.emit('dragend', event)
  }

  attach() {
    this.addEventListener('pointerdown', this.handlePointerDown.bind(this))
    this.addEventListener('pointerup', this.handlePointerUp.bind(this))
    this.addEventListener('pointermove', this.handlePointerMove.bind(this))
  }

  detach() {
    this.removeEventListener('pointerdown', this.handlePointerDown.bind(this))
    this.removeEventListener('pointerup', this.handlePointerUp.bind(this))
    this.removeEventListener('pointermove', this.handlePointerMove.bind(this))
  }
}
