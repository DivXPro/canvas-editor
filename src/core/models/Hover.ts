import { action, makeObservable, observable } from 'mobx'

import { Engine } from '../Engine'
import { DElement } from '../elements'
import { HoverElementEvent } from '../events'

import { Operation } from './Operation'

export interface IHoverOptions {
  engine: Engine
  operation: Operation
}

export class Hover {
  engine: Engine
  operation: Operation
  element?: DElement | null

  constructor(options: IHoverOptions) {
    this.engine = options.engine
    this.operation = options.operation

    makeObservable(this, {
      element: observable.ref,
      setHover: action.bound,
      clear: action.bound,
    })
  }

  setHover(element?: DElement) {
    if (element) {
      this.element = element
    } else {
      this.element = null
    }
    this.trigger()
  }

  clear() {
    this.element = null
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
