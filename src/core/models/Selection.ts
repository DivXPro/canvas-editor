import { action, computed, makeObservable, observable } from 'mobx'

import { DNode, Vector2 } from '../elements'
import { SelectElementEvent, UnselectElementEvent } from '../events/mutation'
import { Engine } from '../Engine'
import { calculateBoundsFromPoints } from '../utils/transform'
import { isArr } from '../utils/types'

import { Operation } from './Operation'

export interface SelectionOptions {
  engine: Engine
  operation: Operation
  selected?: string[]
}

export class Selection {
  engine: Engine
  operation: Operation
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
      target: this.engine.operation?.frame,
      source: this.selectedNodes,
    })

    this.engine.events.emit('element:select', event)
  }

  mapIds(ids: string | DNode | string[] | DNode[]) {
    return Array.isArray(ids) ? ids.map((node: any) => (typeof node === 'string' ? node : node?.id)) : []
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

  get selectedNodes() {
    return this.selected.map(id => this.engine.operation?.frame?.findById(id)).filter(node => node != null)
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

  get selectedRectPoints(): Vector2[] {
    if (this.selectedNodes.length === 1) {
      return this.selectedNodes[0].absRectPoints
    }
    if (this.selectedNodes.length > 1) {
      const nodeRects = this.selectedNodes.map(node => node.absRectPoints)

      const boundPoints: Vector2[] = []

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

  add(...ids: string[] | DNode[]) {
    this.mapIds(ids).forEach(id => {
      if (typeof ids === 'string') {
        if (!this.selected.includes(id)) {
          this.selected.push(id)
          this.indexes[id] = true
        }
      } else {
        this.add(id?.id)
      }
    })
    this.trigger()
  }

  remove(...ids: string[] | DNode[]) {
    this.mapIds(ids).forEach(id => {
      if (typeof ids === 'string') {
        this.selected.clear()
        this.selected.push(...this.selected.filter(item => item !== id))
        delete this.indexes[id]
      } else {
        this.remove(id?.id)
      }
    })
    this.trigger(UnselectElementEvent)
  }

  has(...ids: string[] | DNode[]): boolean {
    return this.mapIds(ids).some(id => {
      if (typeof ids === 'string') {
        return this.indexes[id]
      } else {
        if (!id?.id) return false

        return this.has(id?.id)
      }
    })
  }

  clear() {
    this.selected.clear()
    this.indexes = {}
    this.trigger(UnselectElementEvent)
  }
}
