import { DragMoveEvent, DragStartEvent } from '../events'
import { DragAbleTypes, Engine } from '../models'

export const enableDragEffect = (engine: Engine) => {
  engine.events.on('drag:start', (event: DragStartEvent) => {
    if (!DragAbleTypes.includes(engine.cursor.type)) return
    if (engine.workbench.selection.selected.length === 0) return
    engine.workbench.transformHelper.dragStart(event)
  })

  engine.events.on('drag:move', (event: DragMoveEvent) => {
    engine.workbench.transformHelper.dragMove(event)
  })

  engine.events.on('drag:stop', () => {
    engine.workbench.transformHelper.dragStop()
  })

  engine.events.on('node:transform', () => {
    engine.controlBox?.update()
  })

  engine.events.on('node:drag', () => {
    engine.controlBox?.hide()
  })

  engine.events.on('node:dragEnd', () => {
    engine.controlBox?.update()
  })
}
