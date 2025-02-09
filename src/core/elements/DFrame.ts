import { makeObservable, computed, action, override } from 'mobx'

import { Frame } from '../components/Frame'

import { DFrameBase, DFrameBaseOptions, IDFrameBaseBase } from './DFrameBase'
import { FederatedPointerEvent, Point } from 'pixi.js'

export interface DFrameOptions extends DFrameBaseOptions { }

export interface IDFrameBase extends IDFrameBaseBase { }

export class DFrame extends DFrameBase {
  declare item: Frame
  private _clipsContent: boolean = true

  constructor(options: DFrameOptions) {
    super(options)
    this.root = this.parent?.root ?? this
    this._clipsContent = options.clipsContent ?? true
    makeObservable(this, {
      type: override,
      jsonData: override,
      clipsContent: computed,
      zoomRatio: computed,
      setZoom: action.bound,
    })

    this.item = new Frame({
      app: this.engine.app,
      x: this.position.x,
      y: this.position.y,
      rotation: this.rotation,
      width: this.size.width,
      height: this.size.height,
    })
    this.initChildren(options.children)
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

  get clipsContent() {
    return this._clipsContent
  }

  get jsonData() {
    return {
      ...super.jsonData,
      clipsContent: this.clipsContent,
    }
  }
}
