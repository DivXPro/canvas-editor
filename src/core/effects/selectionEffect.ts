import { Position } from '../elements'
import { SelectionAreaMoveEvent } from '../events'
import { Engine } from '../models'
import { isRectanglePolygonIntersect } from '../utils/polygonIntersect'

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
    if (engine.workbench.selection.selected.length > 0 && !engine.workbench.selection.selecting) {
      if (!engine.workbench.selection.containsPoint({ x: e.offsetX, y: e.offsetY })) {
        engine.workbench.selection.clear()

        checkSelectNode(engine, { x: e.offsetX, y: e.offsetY })
      }
    }
  })

  engine.events.on('selection:move', (e: SelectionAreaMoveEvent) => {
    const nodes = engine.workbench.getSelectableNodes().filter(node => {
      const startPoint = engine.workbench.selection.startPoint
      const rectVertices = [
        { x: startPoint.offsetX, y: startPoint.offsetY },
        { x: e.data.offsetX, y: startPoint.offsetY },
        { x: e.data.offsetX, y: e.data.offsetY },
        { x: startPoint.offsetX, y: e.data.offsetY },
      ]

      return isRectanglePolygonIntersect(rectVertices, node.absVertices)
    })

    engine.workbench.selection.select(nodes.map(node => node.id))
  })
}

const checkSelectNode = (engine: Engine, point: Position) => {
  const nodes = engine.workbench.getSelectableNodes()

  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].containsPoint(point)) {
      engine.workbench.selection.select(nodes[i].id)

      return
    }
  }
}
