import { FederatedPointerEvent } from 'pixi.js'

import {
  SelectionAreaStartEvent,
  SelectionAreaMoveEvent,
  SelectionAreaEndEvent,
  DragStartEvent,
  DragMoveEvent,
  DragStopEvent,
} from '../events'

import { EventDriver } from './EventDriver'

export class SelectionAreaDriver extends EventDriver {
  get selecting() {
    return this.engine.workbench?.selection.selecting ?? false
  }

  set selecting(value: boolean) {
    if (this.engine.workbench) {
      this.engine.workbench.selection.selecting = value
    }
  }

  private onPointdown = (e: PointerEvent) => {
    // TODO: 判断是否有 Node 在范围内
  }

  private onDragStart = (e: DragStartEvent) => {
    if (this.engine.workbench.selection.selected.length === 0) {
      this.selecting = true
      const event = new SelectionAreaStartEvent(e.data)

      this.events.on('drag:move', this.onDragMove)
      this.events.on('drag:stop', this.onDragStop)
      this.events.emit(event.type, event)
    }
  }

  private onDragMove = (e: DragMoveEvent) => {
    if (!this.selecting) return

    const event = new SelectionAreaMoveEvent(e.data)

    this.events.emit(event.type, event)
  }

  private onDragStop = (e: DragStopEvent) => {
    if (!this.selecting) return

    this.selecting = false
    const event = new SelectionAreaEndEvent(e.data)

    this.events.off('drag:move', this.onDragMove)
    this.events.off('drag:stop', this.onDragStop)
    this.events.emit(event.type, event)
  }

  attach() {
    this.events.on('pointerdown', this.onPointdown)

    this.events.on('drag:start', this.onDragStart)
  }

  detach() {
    this.events.off('drag:start', this.onDragStart)
    this.events.off('drag:move', this.onDragMove)
    this.events.off('drag:stop', this.onDragStop)
  }
}
