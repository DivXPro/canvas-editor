import { DeleteNodeEvent } from '../events/mutation/DeleteNodeEvent'
import { Engine } from '../models'
import { isArr } from '../utils/types'

export const enableTransformEffect = (engine: Engine) => {
  engine.events.on('node:transform', () => {
    engine.workbench.controlBox?.update()
  })

  engine.events.on('node:rotate', () => {
    engine.workbench.controlBox?.update()
    engine.workbench.selection.selectedNodes.forEach(node => node.outline?.hide())
  })

  engine.events.on('node:rotateEnd', () => {
    engine.workbench.controlBox?.update()
    engine.workbench.selection.selectedNodes.forEach(node => node.outline?.update())
  })

  engine.events.on('node:drag', () => {
    engine.workbench.controlBox?.hide()
    engine.workbench.selection.selectedNodes.forEach(node => node.outline?.hide())
  })

  engine.events.on('node:dragEnd', () => {
    engine.workbench.controlBox?.update()
    engine.workbench.selection.selectedNodes.forEach(node => node.outline?.update())
  })

  engine.events.on('node:resize', () => {
    engine.workbench.controlBox?.update()
    engine.workbench.selection.selectedNodes.forEach(node => node.outline?.hide())
  })

  engine.events.on('node:resizeEnd', () => {
    engine.workbench.controlBox?.update()
    engine.workbench.selection.selectedNodes.forEach(node => node.outline?.update())
  })

  engine.events.on('node:delete', (event: DeleteNodeEvent) => {
    if (event.data.target) {
      const nodes = isArr(event.data.target) ? event.data.target : [event.data.target]

      engine.workbench.selection.remove(...nodes)
    }
  })
}
