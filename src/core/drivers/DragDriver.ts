import { FederatedPointerEvent } from 'pixi.js'

import { DragMoveEvent, DragStartEvent, DragStopEvent } from '../events'

import { EventDriver } from './EventDriver'

declare type GlobalStateType = {
  dragging: boolean
  onMouseDownAt: number
  startEvent: PointerEvent | DragEvent | MouseEvent | null
  moveEvent: PointerEvent | DragEvent | MouseEvent | null
}

const GlobalState: GlobalStateType = {
  dragging: false,
  onMouseDownAt: 0,
  startEvent: null,
  moveEvent: null,
}

export class DragDriver extends EventDriver {
  mouseDownTimer = null

  private onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey) {
      return
    }
    GlobalState.startEvent = event
    GlobalState.dragging = false
    GlobalState.onMouseDownAt = Date.now()
    this.events.on('pointerup', this.onPointerUp)
    this.events.on('pointermove', this.onDistanceChange)
  }

  private onPointerMove = (event: FederatedPointerEvent) => {
    if (event.clientX === GlobalState.moveEvent?.clientX && event.clientY === GlobalState.moveEvent?.clientY) {
      return
    }
    const dragMoveEvent = new DragMoveEvent(event)

    this.events.emit(dragMoveEvent.type, dragMoveEvent)
    GlobalState.moveEvent = event
  }

  private onPointerUp = (event: PointerEvent) => {
    if (GlobalState.dragging) {
      const dragStopEvent = new DragStopEvent(event)

      this.events.emit(dragStopEvent.type, dragStopEvent)
    }
    this.events.off('pointerup', this.onPointerUp)
    this.events.off('pointermove', this.onDistanceChange)
    this.events.off('pointermove', this.onPointerMove)

    GlobalState.dragging = false
  }

  private onStartDrag = (e: PointerEvent | DragEvent) => {
    if (GlobalState.dragging) return
    GlobalState.startEvent = GlobalState.startEvent || e
    const event = new DragStartEvent(e)

    this.engine.events.emit(event.type, event)
    GlobalState.dragging = true
    this.events.on('pointermove', this.onPointerMove)
  }

  private onDistanceChange = (event: PointerEvent) => {
    const distance =
      GlobalState.startEvent != null
        ? Math.sqrt(
          Math.pow(event.clientX - GlobalState?.startEvent?.clientX, 2) +
          Math.pow(event.clientY - GlobalState?.startEvent?.clientY, 2)
        )
        : 0
    const timeDelta = Date.now() - GlobalState.onMouseDownAt

    if (timeDelta > 10 && event !== GlobalState.startEvent && distance > 5) {
      this.events.off('pointermove', this.onDistanceChange)
      this.onStartDrag(event)
    }
  }
  attach() {
    this.events.on('pointerdown', this.onPointerDown)
  }

  detach() {
    this.events.off('pointerdown', this.onPointerDown)
    this.events.off('pointermove', this.onPointerMove)
    this.events.off('pointerup', this.onPointerUp)
    this.events.off('pointerupoutside', this.onPointerUp)
    this.events.off('pointermove', this.onDistanceChange)
  }
}
