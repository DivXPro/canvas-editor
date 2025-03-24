import { DNode, Position } from '../nodes'
import { HoverNodeEvent, SelectNodeEvent, SelectionAreaMoveEvent, UnselectNodeEvent } from '../events'
import { CursorStatus, Engine } from '../models'
import { isRectanglePolygonIntersect } from '../utils/polygonIntersect'

export const enableSelectionEffect = (engine: Engine) => {
  engine.events.on('pointerdown', e => {
    if (engine.workspace.selection.selected.length === 0) {
      checkSelectNode(engine, { x: e.offsetX, y: e.offsetY })
    } else if (engine.workspace.selection.selected.length > 0) {
      if (!engine.workspace.selection.rectContainsPoint({ x: e.offsetX, y: e.offsetY })) {
        if (!engine.workspace.controlBox?.isOnTransformArea({ x: e.offsetX, y: e.offsetY })) {
          engine.workspace.selection.clear()

          checkSelectNode(engine, { x: e.offsetX, y: e.offsetY })
        }
      }
    }
  })
  engine.events.on('pointerup', e => {
    if (
      engine.workspace.selection.selected.length > 0 &&
      !engine.workspace.selection.selecting &&
      engine.cursor.status === CursorStatus.Normal
    ) {
      if (!engine.workspace.selection.containsPoint({ x: e.offsetX, y: e.offsetY })) {
        if (!engine.workspace.controlBox?.isOnTransformArea({ x: e.offsetX, y: e.offsetY })) {
          engine.workspace.selection.clear()

          checkSelectNode(engine, { x: e.offsetX, y: e.offsetY })
        }
      }
    }
  })

  engine.events.on('selection:move', (e: SelectionAreaMoveEvent) => {
    const nodes = engine.workspace.selectableNodes.filter(node => {
      const startPoint = engine.workspace.selection.startPoint
      const rectVertices = [
        { x: startPoint.offsetX, y: startPoint.offsetY },
        { x: e.data.offsetX, y: startPoint.offsetY },
        { x: e.data.offsetX, y: e.data.offsetY },
        { x: startPoint.offsetX, y: e.data.offsetY },
      ]

      return isRectanglePolygonIntersect(rectVertices, node.absDisplayVertices)
    })

    engine.workspace.selection.select(nodes.map(node => node.id))
  })

  engine.events.on('node:hover', (event: HoverNodeEvent) => {
    if (event.data.source instanceof DNode) {
      event.data.source.outline?.update()
    }
  })

  engine.events.on('node:select', (event: SelectNodeEvent) => {
    engine.workspace.controlBox?.update()
    engine.workspace.selectableNodes.forEach(node => {
      if (!node.isSelected) {
        node.outline?.hide()
      } else {
        node.outline?.update()
      }
    })
  })

  engine.events.on('node:unselect', (event: UnselectNodeEvent) => {
    engine.workspace.controlBox?.update()
    engine.workspace.selectableNodes.forEach(node => {
      if (!node.isSelected) {
        node.outline?.hide()
      }
    })
  })
}

const checkSelectNode = (engine: Engine, point: Position) => {
  const nodes = engine.workspace.selectableNodes

  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].containsPoint(point)) {
      engine.workspace.selection.select(nodes[i].id)

      return
    }
  }
}
