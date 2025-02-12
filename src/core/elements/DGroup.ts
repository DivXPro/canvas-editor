import { Container, Matrix } from 'pixi.js'
import { computed, makeObservable, override } from 'mobx'

import { DFrameBase, DFrameBaseOptions, IDFrameBaseBase } from './DFrameBase'

import { INodeBase, Vector2 } from '.'

export interface DGroupOptions extends DFrameBaseOptions { }

export interface IDGroupBase extends IDFrameBaseBase { }

export class DGroup extends DFrameBase {
  declare item: Container

  static CalculateBoundsFromPoints(points: Vector2[]) {
    const x = Math.min(...points.map(p => p.x))
    const y = Math.min(...points.map(p => p.y))
    const maxX = Math.max(...points.map(p => p.x))
    const maxY = Math.max(...points.map(p => p.y))

    return {
      x,
      y,
      width: maxX - x,
      height: maxY - y,
    }
  }

  constructor(options: DGroupOptions) {
    super(options)
    makeObservable(this, {
      type: override,
      absoluteBoundingBox: override,
      absRectPoints: override,
      jsonData: override,
      childrenPoints: computed,
    })

    this.item = new Container({
      rotation: this.rotation,
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
    return DGroup.CalculateBoundsFromPoints(this.childrenPoints)
  }

  get size() {
    return {
      width: this.absBounds.width,
      height: this.absBounds.height,
    }
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
    const mt = new Matrix()

    mt.translate(-this.globalCenter.x, -this.globalCenter.y)
    mt.rotate(this.globalRotation)
    mt.translate(this.globalCenter.x, this.globalCenter.y)

    return this.localRectPoints.map(point => {
      return mt.apply(point)
    })
  }

  get absoluteBoundingBox() {
    return DGroup.CalculateBoundsFromPoints(this.childrenPoints)
  }
}
