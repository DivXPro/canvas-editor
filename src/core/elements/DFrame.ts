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
    console.log('Frame Pos', this.item.getGlobalPosition(new Point(0, 0)))
    this.initChildren(options.children)
    // this.initInteractive()
  }

  // protected initInteractive() {
  //   if (this.item) {
  //     // this.item.on('pointerenter', this.handlePointerEnter.bind(this))
  //     // this.item.on('pointerleave', this.handlePointerLeave.bind(this))
  //     this.item.on('pointerdown', this.handlePointerDown.bind(this))
  //     this.item.on('pointerup', this.handlePointerUp.bind(this))
  //     this.item.on('pointermove', this.handlePointerMove.bind(this))
  //     // this.item.on('pointertap', this.handlePointerTap.bind(this))
  //     this.eventMode = this.locked ? 'none' : 'static'
  //   }
  // }

  // protected handlePointerDown(event: FederatedPointerEvent) {
  //   this.operation?.selection.clear()
  //   this.operation?.dragMove.dragStart(event)
  //   // event.stopPropagation()
  // }

  // protected handlePointerMove(event: FederatedPointerEvent) {
  //   if (this.operation?.dragMove.dragging) {
  //     this.operation?.dragMove.dragMove(event)
  //   }
  //   // event.stopPropagation()
  // }

  // protected handlePointerUp(event: FederatedPointerEvent) {
  //   if (this.operation?.dragMove.dragging) {
  //     this.operation?.dragMove.dragStop(event)
  //   }
  //   // event.stopPropagation()
  // }

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
