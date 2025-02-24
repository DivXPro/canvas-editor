import { Container, Matrix } from 'pixi.js'
import { computed, makeObservable, override } from 'mobx'

import { Group } from '../components/Group'
import { mergeBounds } from '../utils/transform'

import { DFrameBase, DFrameBaseOptions, IDFrameBaseBase } from './DFrameBase'

import { INodeBase, Position, ResizeHandle, Size } from '.'

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
    this.initChildren(options.children)

    makeObservable(this, {
      type: override,
      absoluteBoundingBox: override,
      serialize: override,
      childrenPoints: computed,
    })
  }

  get innerChildren() {
    return []
  }

  protected initChildren(nodes?: INodeBase[]) {
    const children = this.renderNodes(nodes)

    // 根据 children 重新定位 Group
    children.forEach(child => this.children.push(child))
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

  update() {
    this.children.forEach(child => child.update())
  }
}
