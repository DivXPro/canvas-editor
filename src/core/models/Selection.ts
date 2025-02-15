import { action, computed, makeObservable, observable } from 'mobx'

import { DNode } from '../elements'
import { SelectElementEvent, UnselectElementEvent } from '../events/mutation'
import { Engine } from '../Engine'

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

  select(id: string | DNode) {
    if (typeof id === 'string') {
      if (this.selected.length === 1 && this.selected.includes(id)) {
        this.trigger(SelectElementEvent)

        return
      }
      this.selected.clear()
      this.selected.push(id)
      this.indexes = { [id]: true }
      this.trigger(SelectElementEvent)
    } else {
      this.select(id?.id)
    }
  }

  safeSelect(id: string | DNode) {
    if (!id) return
    this.select(id)
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
