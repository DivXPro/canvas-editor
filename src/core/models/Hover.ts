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
    console.log('setHover', this.operation.selection.selecting)
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
    console.log('clear hover')
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
