import { DragMoveEvent, DragStartEvent } from '../events'
import { DragAbleTypes, Engine } from '../models'

export const enableDragEffect = (engine: Engine) => {
  engine.events.on('drag:start', (event: DragStartEvent) => {
    if (!DragAbleTypes.includes(engine.cursor.type)) return
    if (engine.workspace.selection.selected.length === 0) return
    engine.workspace.transformHelper.dragStart(event)
  })

  engine.events.on('drag:move', (event: DragMoveEvent) => {
    engine.workspace.transformHelper.dragMove(event)
  })

  engine.events.on('drag:stop', () => {
    engine.workspace.transformHelper.dragStop()
  })
}
