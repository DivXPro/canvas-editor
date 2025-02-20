import { DragMoveEvent, DragStartEvent, DragStopEvent } from '../events'
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
  engine.events.on('drag:start', (e: DragStartEvent) => {
    engine.cursor.setStatus(CursorStatus.DragStart)
    engine.cursor.setDragStart({
      clientX: e.data.clientX,
      clientY: e.data.clientY,
      pageX: e.data.pageX,
      pageY: e.data.pageY,
      offsetX: e.data.offsetX,
      offsetY: e.data.offsetY,
    })
  })
  engine.events.on('drag:move', (e: DragMoveEvent) => {
    engine.cursor.setStatus(CursorStatus.Dragging)
    engine.cursor.setPosition({
      clientX: e.data.clientX,
      clientY: e.data.clientY,
      pageX: e.data.pageX,
      pageY: e.data.pageY,
      offsetX: e.data.offsetX,
      offsetY: e.data.offsetY,
    })
  })

  engine.events.on('drag:stop', (e: DragStopEvent) => {
    engine.cursor.setStatus(CursorStatus.DragStop)
    engine.cursor.setDragEnd({
      clientX: e.data.clientX,
      clientY: e.data.clientY,
      pageX: e.data.pageX,
      pageY: e.data.pageY,
      offsetX: e.data.offsetX,
      offsetY: e.data.offsetY,
    })
  })

  engine.events.on('pointermove', (e: PointerEvent) => {
    if (engine.cursor.status !== CursorStatus.Normal) {
      engine.workbench.hover.clear()

      return
    }
    const nodes = engine.workbench.getSelectableNodes()

    const node = nodes.find(n => n.containsPoint({ x: e.offsetX, y: e.offsetY }))

    if (node) {
      engine.workbench.hover.setHover(node)
    } else {
      engine.workbench.hover.clear()
    }
  })
}
