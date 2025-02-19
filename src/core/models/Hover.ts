import { action, makeObservable, observable } from 'mobx'

import { Engine } from './Engine'
import { DNode } from '../elements'
import { HoverElementEvent } from '../events'

import { Workbench } from './Workbench'

export interface IHoverOptions {
  engine: Engine
  operation: Workbench
}

export class Hover {
  engine: Engine
  operation: Workbench
  element?: DNode | null

  constructor(options: IHoverOptions) {
    this.engine = options.engine
    this.operation = options.operation

    makeObservable(this, {
      element: observable.ref,
      setHover: action.bound,
      clear: action.bound,
    })
  }

  setHover(element?: DNode) {
    if (this.operation.selection.selecting) {
      return
    }
    if (element) {
      this.element = element
    } else {
      this.element = null
    }
    this.trigger()
  }

  clear() {
    this.element = null
    this.trigger()
  }

  trigger() {
    if (this.engine) {
      const event = new HoverElementEvent({
        target: this.element,
        source: this.element,
      })

      return this.engine.events.emit(event.type, event)
    }
  }
}
