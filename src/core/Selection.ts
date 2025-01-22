import { action, computed, makeObservable, observable } from 'mobx'

import { DesignApplication } from './DesignApplication'
import { DElement } from './elements'
import { SelectElementEvent, UnselectElementEvent } from './events'

export interface SelectionOptions {
  app: DesignApplication
  selected?: string[]
}

export class Selection {
  app: DesignApplication
  selected = observable.array<string>([])
  indexes: Record<string, boolean> = {}

  constructor(options: SelectionOptions) {
    this.app = options.app
    if (options.selected) {
      this.selected.clear().push(...options.selected)
    }
    makeObservable(this, {
      selected: observable,
      indexes: observable,
      selectedElements: computed,
      select: action.bound,
      add: action.bound,
      remove: action.bound,
      clear: action.bound,
      trigger: action.bound,
    })
  }

  trigger(type = SelectElementEvent) {
    const event = new type({
      target: this.app.frame,
      source: this.selectedElements,
    })

    this.app.events.emit('select:element', event)
  }

  mapIds(ids: string | DElement | string[] | DElement[]) {
    return Array.isArray(ids) ? ids.map((node: any) => (typeof node === 'string' ? node : node?.id)) : []
  }

  select(id: string | DElement) {
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

  safeSelect(id: string | DElement) {
    if (!id) return
    this.select(id)
  }

  get selectedElements() {
    return this.selected.map(id => this.app.frame?.findById(id)).filter(element => element != null)
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

  add(...ids: string[] | DElement[]) {
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

  remove(...ids: string[] | DElement[]) {
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

  has(...ids: string[] | DElement[]): boolean {
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
