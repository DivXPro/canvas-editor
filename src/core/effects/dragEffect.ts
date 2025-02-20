import { DragMoveEvent, DragStartEvent } from '../events'
import { CursorType, Engine } from '../models'

export const enableDragEffect = (engine: Engine) => {
  engine.events.on('darg:start', (event: DragStartEvent) => {
    if (engine.cursor.type !== CursorType.Default) return
    if (engine.workbench.selection.selected.length === 0) return
    engine.workbench.transformHelper.dragStart(event)
  })

  engine.events.on('darg:move', (event: DragMoveEvent) => {
    engine.workbench.transformHelper.dragMove(event)
  })
}
