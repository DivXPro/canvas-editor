import { Container, Matrix } from 'pixi.js'
import { action, computed, makeObservable, override } from 'mobx'

import { Group } from '../components/Group'
import { mergeBounds } from '../utils/transform'
import { Engine } from '../models'

import { DFrameAbs, IDFrameAbsBase } from './DFrameAbs'
import { Position, ResizeHandle, Size } from './type'

export interface IDGroupBase extends IDFrameAbsBase { }

export class DGroup extends DFrameAbs {
  declare item: Container

  constructor(engine: Engine, options: IDGroupBase) {
    super(engine, options)
    this.item = new Group({
      rotation: this.rotation,
      x: this.position.x,
      y: this.position.y,
      width: options.size.width,
      height: options.size.height,
    })
    this.initChildren(options.children)

    makeObservable(this, {
      type: override,
      absoluteBoundingBox: override,
      serialize: override,
      childrenPoints: computed,
      ungroup: action.bound,
    })
  }

  get innerChildren() {
    return []
  }

  get childrenPoints() {
    const childrenBounds = (this.children ?? []).map(child => child.absDisplayVertices)

    const boundPoints: Position[] = []

    childrenBounds.map(bounds => {
      boundPoints.push(...bounds)
    })

    return boundPoints
  }

  get localRectPoints() {
    const mt = new Matrix()

    mt.translate(-this.globalCenter.x, -this.globalCenter.y)
    mt.rotate(-this.globalRotation)
    mt.translate(this.globalCenter.x, this.globalCenter.y)

    const points = this.childrenPoints.map(point => {
      return mt.apply(point)
    })

    return points
  }

  get absoluteBoundingBox() {
    return mergeBounds(this.children.map(child => child.absoluteBoundingBox))
  }

  setPosition(x: number, y: number) {
    this._position = { x, y }
    const pos = this.root != null ? this.root.tansformRoot2Local({ x, y }) : { x, y }

    this.item?.position.set(pos.x, pos.y)
  }

  containsPoint(point: Position) {
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i]

      if (child.containsPoint(point)) return true
    }

    return false
  }

  resize(handle: ResizeHandle, size: Size) {
    const oldSize = this.size

    const scaleX = size.width / oldSize.width
    const scaleY = size.height / oldSize.height

    this.resizeChildren(scaleX, scaleY)
    super.resize(handle, size)
  }

  resizeChildren(scaleX: number, scaleY: number) {
    this.children.forEach(child => {
      const size = {
        width: child.size.width * scaleX,
        height: child.size.height * scaleY,
      }
      const position = {
        x: child.position.x * scaleX,
        y: child.position.y * scaleY,
      }

      child.setSize(size)
      child.setPosition(position.x, position.y)
    })
  }

  ungroup() {
    console.log('serialize', this.serialize())
    const children = this.children.slice().sort((childA, childB) => {
      return childA.index - childB.index
    })

    children.forEach(child => {
      console.log(`kick node ${child.id} from Group to join ${this.parent?.id}`)
      if (this.parent) {
        child.joinGroupAt(this.parent, this.index)
      } else {
        if (child.item != null) {
          this.engine.app.stage.addChildAt(child.item, this.index)
        }
        this.engine.workbench.canvaNodes.push(child)
      }
    })
    this.destory()
  }

  update() {
    this.children.forEach(child => child.update())
  }
}
