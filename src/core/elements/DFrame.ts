import { makeObservable, computed, action, observe, override } from 'mobx'

import { Frame } from '../components/Frame'

import { DElement, IDElement, IDElementInstance } from './DElement'
import { DGroup, DGroupOptions } from './DGroup'

export interface DFrameOptions extends DGroupOptions { }

export interface IDFrame extends IDElement {
  type: 'Frame'
  items?: IDElement[]
}

export class DFrame extends DGroup {
  declare item: Frame

  constructor(options: DFrameOptions) {
    super(options)
    makeObservable(this, {
      type: override,
      jsonData: override,
      zoomRatio: computed,
      setZoom: action.bound,
    })
    this.item = new Frame({
      app: this.engine.app,
      x: options.x,
      y: options.y,
      rotation: options.rotation ?? 0,
      width: options.width ?? 0,
      height: options.height ?? 0,
    })
    this.init(options.items)
  }

  get type() {
    return 'Frame'
  }

  get zoomRatio() {
    return this.item.scale.x
  }

  set zoomRatio(zoom: number) {
    this.setZoom(zoom)
  }

  setZoom(zoom: number) {
    this.item.zoomRatio = zoom
  }

  get jsonData() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      width: this.width / this.engine.zoomRatio,
      height: this.height / this.engine.zoomRatio,
      rotation: this.rotation,
      name: this.name,
      type: this.type,
      items: this.children.map(child => child.jsonData),
      locked: this.locked,
      hidden: this.hidden,
    }
  }
}
