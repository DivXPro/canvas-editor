import { action, computed, makeObservable, observable } from 'mobx'

import { DNode, Position } from '../elements'
import { SelectElementEvent, UnselectElementEvent } from '../events/mutation'
import { calculateBoundsFromPoints } from '../utils/transform'
import { isArr } from '../utils/types'
import { isPointInPointsArea } from '../utils/hitConfirm'

import { Engine } from './Engine'
import { Workbench } from './Workbench'

export interface SelectionOptions {
  engine: Engine
  operation: Workbench
  selected?: string[]
}

export class Selection {
  engine: Engine
  operation: Workbench
  selected = observable.array<string>([])
  indexes: Record<string, boolean> = {}
  selecting = false

  constructor(options: SelectionOptions) {
    this.engine = options.engine
    this.operation = options.operation
    makeObservable(this, {
      selected: observable,
      indexes: observable,
      selectedNodes: computed,
      startPoint: computed,
      selectedRectPoints: computed,
      select: action.bound,
      trigger: action.bound,
      add: action.bound,
      remove: action.bound,
      clear: action.bound,
    })
    if (options.selected) {
      this.selected.clear().push(...options.selected)
    }
  }

  trigger(type = SelectElementEvent) {
    const event = new type({
      target: this.selectedNodes,
      source: this.selectedNodes,
    })

    this.engine.events.emit(event.type, event)
  }

  mapIds(ids: string | DNode | string[] | DNode[]) {
    return Array.isArray(ids) ? ids.map((node: string | DNode) => (typeof node === 'string' ? node : node?.id)) : []
  }

  select(ids: string | DNode | Array<string | DNode>): void {
    if (!isArr(ids)) {
      return this.select([ids])
    }
    if (isArr(ids) && ids.some(id => typeof id !== 'string')) {
      return this.select(
        ids.map(idOrNode => {
          if (typeof idOrNode === 'string') {
            return idOrNode
          } else {
            return idOrNode?.id
          }
        })
      )
    }

    const nodeIds = isArr(ids) ? (ids as string[]) : ([ids] as string[])

    if (this.selected.length === nodeIds.length && nodeIds.every(id => this.indexes[id])) {
      return
    }
    this.selected.clear()
    this.selected.push(...nodeIds)
    this.indexes = {}
    nodeIds.forEach(id => {
      this.indexes[id] = true
    })
    this.trigger(SelectElementEvent)
  }

  safeSelect(ids: string | DNode | Array<string | DNode>) {
    if (!ids) return
    this.select(ids)
  }

  get startPoint() {
    return this.engine.cursor.dragStartPosition
  }

  get selectedNodes() {
    return this.selected.map(id => this.engine.workbench.findById(id)).filter(node => node != null)
  }

  get first() {
    if (this.selected && this.selected.length) return this.selected[0]
  }

  get last() {
    if (this.selected && this.selected.length) {
      return this.selected[this.selected.length - 1]
    }
  }

  get length() {
    return this.selected.length
  }

  get selectedRectPoints(): Position[] {
    if (this.selectedNodes.length === 1) {
      return this.selectedNodes[0].absVertices
    }
    if (this.selectedNodes.length > 1) {
      const nodeRects = this.selectedNodes.map(node => node.absVertices)

      const boundPoints: Position[] = []

      nodeRects.map(rectPoint => {
        boundPoints.push(...rectPoint)
      })

      const bounds = calculateBoundsFromPoints(boundPoints)

      return [
        { x: bounds.x, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
        { x: bounds.x, y: bounds.y + bounds.height },
      ]
    }

    return []
  }

  rectContainsPoint(point: Position) {
    return isPointInPointsArea(point, this.selectedRectPoints)
  }

  containsPoint(point: Position) {
    if (this.selected.length === 0) {
      return false
    }
    for (let i = 0; i < this.selectedNodes.length; i++) {
      const node = this.selectedNodes[i]

      if (node.containsPoint(point)) {
        return true
      }
    }

    return false
  }

  add(...ids: string[] | DNode[]) {
    this.mapIds(ids).forEach(id => {
      if (!this.selected.includes(id)) {
        this.selected.push(id)
        this.indexes[id] = true
      }
    })
    this.trigger()
  }

  remove(...ids: string[] | DNode[]) {
    this.mapIds(ids).forEach(id => {
      this.selected.push(...this.selected.filter(item => item !== id))
      delete this.indexes[id]
    })
    this.trigger(UnselectElementEvent)
  }

  has(...ids: string[] | DNode[]): boolean {
    return this.mapIds(ids).some(id => {
      return this.indexes[id]
    })
  }

  clear() {
    this.selected.clear()
    this.indexes = {}
    this.trigger(UnselectElementEvent)
  }
}
