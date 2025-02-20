import { Position } from '../elements'
import { Engine } from '../models'

export const enableSelectionEffect = (engine: Engine) => {
  engine.events.on('pointerdown', e => {
    if (engine.workbench.selection.selected.length === 0) {
      checkSelectNode(engine, { x: e.offsetX, y: e.offsetY })
    } else if (engine.workbench.selection.selected.length > 0) {
      if (!engine.workbench.selection.rectContainsPoint({ x: e.offsetX, y: e.offsetY })) {
        engine.workbench.selection.clear()

        checkSelectNode(engine, { x: e.offsetX, y: e.offsetY })
      }
    }
  })
  engine.events.on('pointerup', e => {
    if (engine.workbench.selection.selected.length > 0) {
      if (!engine.workbench.selection.containsPoint({ x: e.offsetX, y: e.offsetY })) {
        engine.workbench.selection.clear()

        checkSelectNode(engine, { x: e.offsetX, y: e.offsetY })
      }
    }
  })
}

const checkSelectNode = (engine: Engine, point: Position) => {
  const topNodesOnCanvas = engine.workbench.canvaNodes.filter(node => node.type !== 'FRAME')
  const topNodesInFrame = engine.workbench.canvaNodes
    .filter(node => node.type === 'FRAME')
    .map(node => node.children ?? [])
  const topNodes = [...topNodesOnCanvas, ...topNodesInFrame.flat()]

  for (let i = 0; i < topNodes.length; i++) {
    if (topNodes[i].containsPoint(point)) {
      engine.workbench.selection.select(topNodes[i].id)

      return
    }
  }
}
