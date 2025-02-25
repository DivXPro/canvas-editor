import { action, makeObservable, observable } from 'mobx'

import { DNode } from '../nodes'
import { HoverNodeEvent } from '../events'

import { Engine } from './Engine'
import { Workbench } from './Workbench'
import { CursorType } from './Cursor'

export interface IHoverOptions {
  engine: Engine
  operation: Workbench
}

export class Hover {
  engine: Engine
  operation: Workbench
  node?: DNode | null

  constructor(options: IHoverOptions) {
    this.engine = options.engine
    this.operation = options.operation

    makeObservable(this, {
      node: observable.ref,
      setHover: action.bound,
      clear: action.bound,
    })
  }

  setHover(node?: DNode) {
    if (this.operation.selection.selecting) {
      return
    }
    if (node) {
      this.node = node
    } else {
      this.node = null
    }
    this.trigger()
  }

  clear() {
    if (this.node != null && this.node.isSelected === false) {
      this.node?.outline?.hide()
    }

    this.node = null
  }

  trigger() {
    if (this.engine) {
      const event = new HoverNodeEvent({
        target: this.node,
        source: this.node,
      })

      return this.engine.events.emit(event.type, event)
    }
  }
}
