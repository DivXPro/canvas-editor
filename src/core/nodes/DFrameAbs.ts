import { makeObservable, observable, action, observe, IObservableArray, override } from 'mobx'
import { Container } from 'pixi.js'

import { Engine } from '../models/Engine'

import { DNode, INodeBase } from './DNode'
import { Size, LayoutConstraint, Position } from './type'

export interface IDFrameAbsBase extends INodeBase {
  children?: INodeBase[]
  size: Size
  constraints?: LayoutConstraint
  clipsContent?: boolean
}

export type ItemPostionType = 'relative' | 'absolute'

const DefaultLayoutConstraint: LayoutConstraint = {
  vertical: 'TOP',
  horizontal: 'LEFT',
}

export abstract class DFrameAbs extends DNode {
  declare item: Container
  children: IObservableArray<DNode> = observable.array<DNode>([])
  constraints: LayoutConstraint

  constructor(engine: Engine, options: IDFrameAbsBase) {
    super(engine, options)
    this.constraints = options.constraints ?? DefaultLayoutConstraint
    this.setupChildrenObserver()
    makeObservable(this, {
      type: override,
      serialize: override,
      children: observable,
      constraints: observable,
      renderNodes: action.bound,
      addChild: action.bound,
      addChildAt: action.bound,
      removeChild: action.bound,
      initChildren: action.bound,
    })
  }

  abstract innerChildren: Container[]

  addChild(node: DNode) {
    this.children.push(node)
  }

  addChildAt(node: DNode, index: number) {
    if (index > this.children.length) {
      throw new Error(`Index ${index} is out of bounds for children array with length ${this.children.length}`)
    }
    this.children.splice(index, 0, node)
  }

  removeChild(node: DNode) {
    if (!this.children.includes(node)) return
    this.children.remove(node)
  }

  initChildren(nodes?: INodeBase[]) {
    const children = this.renderNodes(nodes)

    children.forEach(child => this.addChild(child))
  }

  tansformRoot2Local(point: Position) {
    if (this.root == null) {
      return point
    }

    return this.item?.toLocal(this.root.item?.toGlobal(point) ?? point) ?? point
  }

  renderNodes(nodes: INodeBase[] = []) {
    const children: DNode[] = []

    nodes
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
      .forEach(item => {
        console.debug('renderNodes', this)
        const child = this.engine.workspace?.generateElement(item, this.id)

        child && children.push(child)
      })

    return children
  }

  protected setupChildrenObserver() {
    observe(this.children, change => {
      if (change.type === 'splice') {
        if (change.added.length > 0) {
          // 在这里处理添加元素的逻辑
          this.onElementsAdded(change.added)
        }
        if (change.removed.length > 0) {
          // 在这里处理移除元素的逻辑
          this.onElementsRemoved(change.removed)
        }
      }
    })
  }

  protected onElementsAdded(elements: DNode[]) {
    // 处理添加元素的逻辑
    elements.forEach(element => {
      // 例如，将元素添加到 Frame 中
      if (element.item && !this.item?.children.includes(element.item)) {
        this.item?.addChildAt(element.item, this.children.indexOf(element) + this.innerChildren.length)
      }
    })
  }

  protected onElementsRemoved(elements: DNode[]) {
    // 处理移除元素的逻辑
    elements.forEach(element => {
      // 例如，从 Frame 中移除元素
      if (element.item) {
        this.item?.removeChild(element.item)
      }
    })
  }

  serialize(clone?: boolean): IDFrameAbsBase {
    return {
      ...super.serialize(clone),
      children: this.children.map(child => child.serialize(clone)),
      constraints: this.constraints,
    }
  }
}
