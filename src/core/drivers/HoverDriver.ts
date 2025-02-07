import { FederatedPointerEvent } from 'pixi.js'

import { DesignApplication } from '../DesignApplication'
import { DElement } from '../elements/DElement'

import { EventDriver } from './EventDriver'

export interface HoverElementEvent {
  data: {
    source: DElement
  }
}

export interface UnhoverElementEvent {
  data: {
    source: DElement
  }
}

export class HoverDriver extends EventDriver {
  private hoveredElement: DElement | null = null

  constructor(app: DesignApplication) {
    super(app)
  }

  attach() {
    this.app.events.on('pointerenter', this.handlePointerEnter.bind(this))
    this.app.events.on('pointerleave', this.handlePointerLeave.bind(this))
  }

  detach() {
    this.app.events.off('pointerenter', this.handlePointerEnter.bind(this))
    this.app.events.off('pointerleave', this.handlePointerLeave.bind(this))
  }

  private handlePointerEnter(event: FederatedPointerEvent) {
    // const element = event.target
    // if (element && element instanceof DElement) {
    //   this.hoveredElement = element
    //   this.app.events.emit('element:hover', { data: { source: element } })
    // }
  }

  private handlePointerLeave(event: PointerEvent) {
    // const element = event.target as DElement
    // if (element && element instanceof DElement && this.hoveredElement === element) {
    //   this.hoveredElement = null
    //   this.app.events.emit('element:unhover', { data: { source: element } })
    // }
  }
}