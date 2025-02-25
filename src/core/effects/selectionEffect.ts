import { DNode, Position } from '../nodes'
import { HoverNodeEvent, SelectNodeEvent, SelectionAreaMoveEvent, UnselectNodeEvent } from '../events'
import { CursorStatus, Engine } from '../models'
import { isRectanglePolygonIntersect } from '../utils/polygonIntersect'

export const enableSelectionEffect = (engine: Engine) => {
  engine.events.on('pointerdown', e => {
    if (engine.workbench.selection.selected.length === 0) {
      checkSelectNode(engine, { x: e.offsetX, y: e.offsetY })
    } else if (engine.workbench.selection.selected.length > 0) {
      if (!engine.workbench.selection.rectContainsPoint({ x: e.offsetX, y: e.offsetY })) {
        if (!engine.workbench.controlBox?.isOnTransformArea({ x: e.offsetX, y: e.offsetY })) {
          engine.workbench.selection.clear()

          checkSelectNode(engine, { x: e.offsetX, y: e.offsetY })
        }
      }
    }
  })
  engine.events.on('pointerup', e => {
    if (
      engine.workbench.selection.selected.length > 0 &&
      !engine.workbench.selection.selecting &&
      engine.cursor.status === CursorStatus.Normal
    ) {
      if (!engine.workbench.selection.containsPoint({ x: e.offsetX, y: e.offsetY })) {
        if (!engine.workbench.controlBox?.isOnTransformArea({ x: e.offsetX, y: e.offsetY })) {
          engine.workbench.selection.clear()

          checkSelectNode(engine, { x: e.offsetX, y: e.offsetY })
        }
      }
    }
  })

  engine.events.on('selection:move', (e: SelectionAreaMoveEvent) => {
    const nodes = engine.workbench.selectableNodes.filter(node => {
      const startPoint = engine.workbench.selection.startPoint
      const rectVertices = [
        { x: startPoint.offsetX, y: startPoint.offsetY },
        { x: e.data.offsetX, y: startPoint.offsetY },
        { x: e.data.offsetX, y: e.data.offsetY },
        { x: startPoint.offsetX, y: e.data.offsetY },
      ]

      return isRectanglePolygonIntersect(rectVertices, node.absDisplayVertices)
    })

    engine.workbench.selection.select(nodes.map(node => node.id))
  })

  engine.events.on('node:hover', (event: HoverNodeEvent) => {
    if (event.data.source instanceof DNode) {
      event.data.source.outline?.update()
    }
  })

  engine.events.on('node:select', (event: SelectNodeEvent) => {
    engine.workbench.controlBox?.update()
    engine.workbench.selectableNodes.forEach(node => {
      if (!node.isSelected) {
        node.outline?.hide()
      } else {
        node.outline?.update()
      }
    })
  })

  engine.events.on('node:unselect', (event: UnselectNodeEvent) => {
    engine.workbench.controlBox?.update()
    engine.workbench.selectableNodes.forEach(node => {
      if (!node.isSelected) {
        node.outline?.hide()
      }
    })
  })
}

const checkSelectNode = (engine: Engine, point: Position) => {
  const nodes = engine.workbench.selectableNodes

  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].containsPoint(point)) {
      engine.workbench.selection.select(nodes[i].id)

      return
    }
  }
}
