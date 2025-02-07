import { FederatedPointerEvent } from 'pixi.js'

import { DragStartEvent } from '../events'

import { EventDriver } from './EventDriver'

const GlobalState = {
  isDragging: false,
  onPointerDownAt: 0,
  startEvent: null,
  moveEvent: null,
}

export class DragDropDriver extends EventDriver {
  private handlePointerDown(event: FederatedPointerEvent) {
    GlobalState.isDragging = false
    const canvasPosition = this.app.stage.toLocal(event.global)
    const dragStartEvent = new DragStartEvent({
      clientX: event.clientX,
      clientY: event.clientY,
      pageX: event.pageX,
      pageY: event.pageY,
      target: event.target,
      view: event.view,
      canvasX: canvasPosition.x,
      canvasY: canvasPosition.y,
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
  }

  detach() {
  }
}
