import { DragStartEvent } from '../events'
import { Engine, CursorStatus } from '../models'

export const enableCursorEffect = (engine: Engine) => {
  engine.events.on('pointermove', e => {
    engine.cursor.setStatus(
      engine.cursor.status === CursorStatus.Dragging || engine.cursor.status === CursorStatus.DragStart
        ? engine.cursor.status
        : CursorStatus.Normal
    )
    if (engine.cursor.status === CursorStatus.Dragging) return
    engine.cursor.setPosition({
      clientX: e.clientX,
      clientY: e.clientY,
      pageX: e.pageX,
      pageY: e.pageY,
      offsetX: e.offsetX,
      offsetY: e.offsetY,
    })
  })
  engine.events.on('drag:start', (event: DragStartEvent) => {
    engine.cursor.setStatus(CursorStatus.DragStart)
    engine.cursor.setDragStart(event.data)
  })
  engine.events.on('drag:move', event => {
    engine.cursor.setStatus(CursorStatus.Dragging)
    engine.cursor.setPosition(event.data)
  })

  engine.events.on('drag:stop', event => {
    engine.cursor.setStatus(CursorStatus.DragStop)
    engine.cursor.setDragEnd(event.data)
  })
}
