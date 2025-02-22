import {
  SelectionAreaStartEvent,
  SelectionAreaMoveEvent,
  SelectionAreaEndEvent,
  DragStartEvent,
  DragMoveEvent,
  DragStopEvent,
} from '../events'
import { CursorDragType } from '../models'

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

  private onDragStart = (e: DragStartEvent) => {
    if (this.engine.workbench.selection.selected.length === 0) {
      this.engine.cursor.dragType = CursorDragType.Selection

      const event = new SelectionAreaStartEvent(e.data)

      this.events.emit(event.type, event)
      this.events.on('drag:move', this.onDragMove)
      this.events.on('drag:stop', this.onDragStop)
    }
  }

  private onDragMove = (e: DragMoveEvent) => {
    if (this.engine.cursor.dragType !== CursorDragType.Selection) return

    const event = new SelectionAreaMoveEvent(e.data)

    this.events.emit(event.type, event)
  }

  private onDragStop = (e: DragStopEvent) => {
    if (this.engine.cursor.dragType !== CursorDragType.Selection) return

    const event = new SelectionAreaEndEvent(e.data)

    this.events.off('drag:move', this.onDragMove)
    this.events.off('drag:stop', this.onDragStop)
    this.events.emit(event.type, event)
  }

  attach() {
    this.events.on('drag:start', this.onDragStart)
  }

  detach() {
    this.events.off('drag:start', this.onDragStart)
    this.events.off('drag:move', this.onDragMove)
    this.events.off('drag:stop', this.onDragStop)
  }
}
