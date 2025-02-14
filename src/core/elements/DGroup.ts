import { Container, Matrix } from 'pixi.js'
import { computed, makeObservable, override } from 'mobx'

import { Group } from '../components/Group'
import { calculateBoundsFromPoints } from '../utils/transform'

import { DFrameBase, DFrameBaseOptions, IDFrameBaseBase } from './DFrameBase'

import { INodeBase, Vector2 } from '.'
import { chdir } from 'process'

export interface DGroupOptions extends DFrameBaseOptions { }

export interface IDGroupBase extends IDFrameBaseBase { }

export class DGroup extends DFrameBase {
  declare item: Container

  constructor(options: DGroupOptions) {
    super(options)
    makeObservable(this, {
      type: override,
      absoluteBoundingBox: override,
      absRectPoints: override,
      jsonData: override,
      childrenPoints: computed,
    })

    this.item = new Group({
      rotation: this.rotation,
      x: this.position.x,
      y: this.position.y,
      width: options.size.width,
      height: options.size.height,
    })
    this.initChildren(options.children)
  }

  protected initChildren(nodes?: INodeBase[]) {
    this.setupChildrenObserver()
    const children = this.renderNodes(nodes)

    // 根据 children 重新定位 Group
    children.forEach(child => this.children.push(child))
  }

  get childrenPoints() {
    const childrenBounds = (this.children ?? []).map(child => child.absRectPoints)

    const boundPoints: Vector2[] = []

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

  get absRectPoints() {
    const bounds = calculateBoundsFromPoints(this.localRectPoints)
    const points = [
      { x: bounds.x, y: bounds.y },
      { x: bounds.x + bounds.width, y: bounds.y },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
      { x: bounds.x, y: bounds.y + bounds.height },
    ]
    const mt = new Matrix()

    mt.translate(-this.globalCenter.x, -this.globalCenter.y)
    mt.rotate(this.globalRotation)
    mt.translate(this.globalCenter.x, this.globalCenter.y)

    return points.map(point => {
      return mt.apply(point)
    })
  }

  get absoluteBoundingBox() {
    return calculateBoundsFromPoints(this.childrenPoints)
  }

  setPosition(x: number, y: number) {
    this._position = { x, y }
    const pos = this.root != null ? this.root.tansformRoot2Local({ x, y }) : { x, y }
    const offset = { x: x - this.position.x, y: y - this.position.y }

    this.item?.position.set(pos.x, pos.y)
    this.children.forEach(child => {
      child.setPosition(child.position.x + offset.x, child.position.y + offset.y)
    })
  }
}
