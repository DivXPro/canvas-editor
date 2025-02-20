import { Container, Matrix } from 'pixi.js'
import { computed, makeObservable, override } from 'mobx'

import { Group } from '../components/Group'
import { calculateBoundsFromPoints } from '../utils/transform'

import { DFrameBase, DFrameBaseOptions, IDFrameBaseBase } from './DFrameBase'

import { INodeBase, Position } from '.'

export interface DGroupOptions extends DFrameBaseOptions { }

export interface IDGroupBase extends IDFrameBaseBase { }

export class DGroup extends DFrameBase {
  declare item: Container

  constructor(options: DGroupOptions) {
    super(options)
    this.item = new Group({
      rotation: this.rotation,
      x: this.position.x,
      y: this.position.y,
      width: options.size.width,
      height: options.size.height,
    })
    console.log('DGroup', this.position)
    this.initChildren(options.children)

    makeObservable(this, {
      type: override,
      absoluteBoundingBox: override,
      serialize: override,
      childrenPoints: computed,
    })
  }

  protected initChildren(nodes?: INodeBase[]) {
    this.setupChildrenObserver()
    const children = this.renderNodes(nodes)

    // 根据 children 重新定位 Group
    children.forEach(child => this.children.push(child))
  }

  get childrenPoints() {
    const childrenBounds = (this.children ?? []).map(child => child.absRectPoints)

    const boundPoints: Position[] = []

    childrenBounds.map(bounds => {
      boundPoints.push(...bounds)
    })

    return boundPoints
  }

  get absBounds() {
    return calculateBoundsFromPoints(this.childrenPoints)
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
    return calculateBoundsFromPoints(this.childrenPoints)
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
}
