import { makeObservable, computed, action, override, observable } from 'mobx'
import { Container } from 'pixi.js'

import { Frame } from '../components/Frame'
import { Engine } from '../models'

import { DFrameBase, IDFrameBaseBase } from './DFrameBase'
import { Color } from './type'

export interface IDFrameBase extends IDFrameBaseBase {
  backgroundColor: Color
}

export interface DFrameOptions extends IDFrameBase {
  engine: Engine
  parent?: DFrameBase
  backgroundColor: Color
}

export class DFrame extends DFrameBase {
  declare item: Frame
  backgroundColor: Color
  private _clipsContent: boolean = true

  constructor(options: DFrameOptions) {
    super(options)
    this.root = this.parent?.root ?? this
    this._clipsContent = options.clipsContent ?? true
    this.backgroundColor = options.backgroundColor ?? '#ffffff'
    makeObservable(this, {
      type: override,
      serialize: override,
      clipsContent: computed,
      zoomRatio: computed,
      backgroundColor: observable,
      setZoom: action.bound,
    })

    this.item = new Frame({
      app: this.engine.app,
      engine: this.engine,
      x: this.position.x,
      y: this.position.y,
      rotation: this.rotation,
      width: this.size.width,
      height: this.size.height,
    })
    this.initChildren(options.children)
  }

  get innerChildren() {
    return [this.item.background, this.item.mask] as Container[]
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

  update(): void {
    throw new Error('Method not implemented.')
  }

  serialize() {
    return {
      ...super.serialize(),
      clipsContent: this.clipsContent,
      backgroundColor: { ...this.backgroundColor },
    }
  }
}
