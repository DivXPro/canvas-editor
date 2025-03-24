import { DeleteNodeEvent } from '../events/mutation/DeleteNodeEvent'
import { Engine } from '../models'
import { isArr } from '../utils/types'

export const enableTransformEffect = (engine: Engine) => {
  engine.events.on('node:transform', () => {
    engine.workspace.controlBox?.update()
  })

  engine.events.on('node:rotate', () => {
    engine.workspace.controlBox?.update()
    engine.workspace.selection.selectedNodes.forEach(node => node.outline?.hide())
  })

  engine.events.on('node:rotateEnd', () => {
    engine.workspace.controlBox?.update()
    engine.workspace.selection.selectedNodes.forEach(node => node.outline?.update())
  })

  engine.events.on('node:drag', () => {
    engine.workspace.controlBox?.hide()
    engine.workspace.selection.selectedNodes.forEach(node => node.outline?.hide())
  })

  engine.events.on('node:dragEnd', () => {
    engine.workspace.controlBox?.update()
    engine.workspace.selection.selectedNodes.forEach(node => node.outline?.update())
  })

  engine.events.on('node:resize', () => {
    engine.workspace.controlBox?.update()
    engine.workspace.selection.selectedNodes.forEach(node => node.outline?.hide())
  })

  engine.events.on('node:resizeEnd', () => {
    engine.workspace.controlBox?.update()
    engine.workspace.selection.selectedNodes.forEach(node => node.outline?.update())
  })

  engine.events.on('node:delete', (event: DeleteNodeEvent) => {
    if (event.data.target) {
      const nodes = isArr(event.data.target) ? event.data.target : [event.data.target]

      engine.workspace.selection.remove(...nodes)
    }
  })
}
