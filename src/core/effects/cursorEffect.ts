import { DragMoveEvent, DragStartEvent, DragStopEvent } from '../events'
import { Engine, CursorStatus, CornerResizeStyles, CursorType, RotateStyles, CursorViewOffset } from '../models'

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

  // 通过移动判断 hover
  engine.events.on('pointermove', (e: PointerEvent) => {
    if (engine.cursor.status !== CursorStatus.Normal) {
      engine.workbench.hover.clear()

      return
    }
    const nodes = engine.workbench.selectableNodes

    const node = nodes.find(n => n.containsPoint({ x: e.offsetX, y: e.offsetY }))

    if (node) {
      engine.workbench.hover.setHover(node)
    } else {
      engine.workbench.hover.clear()
    }
  })

  // 通过移动判断 ControlBox 的控制区域
  engine.events.on('pointermove', (e: PointerEvent) => {
    if (
      engine.workbench.selection.selected.length === 0 ||
      engine.controlBox == null ||
      engine.cursor.status === CursorStatus.DragStart ||
      engine.cursor.status === CursorStatus.Dragging ||
      e.buttons === 1
    ) {
      return
    }
    for (let i = 0; i < engine.controlBox.handles.length; i++) {
      const handle = engine.controlBox.handles[i]
      const point = handle.toLocal({ x: e.offsetX + CursorViewOffset, y: e.offsetY + CursorViewOffset })

      if (engine.controlBox.isLocalPointOnHandler(point, i)) {
        engine.cursor.type = CornerResizeStyles[i]

        return
      }
      if (engine.controlBox.isLocalPointOnRotateHandler(point, i)) {
        engine.cursor.type = RotateStyles[i]

        return
      }
    }

    if (
      engine.controlBox.isPointOnHorizontalBorder({
        x: e.offsetX + CursorViewOffset * 1.5,
        y: e.offsetY + CursorViewOffset * 1.5,
      })
    ) {
      engine.cursor.type = CursorType.NsResize

      return
    }

    if (
      engine.controlBox.isPointOnVerticalBorder({
        x: e.offsetX + CursorViewOffset * 1.5,
        y: e.offsetY + CursorViewOffset * 1.5,
      })
    ) {
      engine.cursor.type = CursorType.EwResize

      return
    }

    engine.cursor.type = CursorType.Pointer
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
}
