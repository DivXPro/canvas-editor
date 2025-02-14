import { makeObservable, observable, action, observe, IObservableArray, override } from 'mobx'

import { Engine } from '../Engine'

import { DNode, INodeBase } from './DNode'
import { Size, Color, LayoutConstraint, Vector2 } from './type'

export interface IDFrameBaseBase extends INodeBase {
  children?: INodeBase[]
  size: Size
  backgroundColor: Color
  constraints?: LayoutConstraint
  clipsContent?: boolean
}

export interface DFrameBaseOptions extends IDFrameBaseBase {
  engine: Engine
  parent?: DFrameBase
}

export type ItemPostionType = 'relative' | 'absolute'

const DefaultLayoutConstraint: LayoutConstraint = {
  vertical: 'TOP',
  horizontal: 'LEFT',
}

export abstract class DFrameBase extends DNode implements IDFrameBaseBase {
  declare _size: Size
  backgroundColor: Color
  children: IObservableArray<DNode> = observable.array<DNode>([])
  constraints: LayoutConstraint

  constructor(options: DFrameBaseOptions) {
    super(options)
    this.backgroundColor = options.backgroundColor
    this.constraints = options.constraints ?? DefaultLayoutConstraint

    makeObservable(this, {
      type: override,
      jsonData: override,
      size: override,
      children: observable,
      renderNodes: action.bound,
    })
  }

  protected initChildren(nodes?: INodeBase[]) {
    this.setupChildrenObserver()
    const children = this.renderNodes(nodes)

    children.forEach(child => this.children.push(child))
  }

  tansformRoot2Local(point: Vector2) {
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
        const child = this.engine.operation?.generateElement(item, this)

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
      if (element.item) {
        this.item?.addChild(element.item)
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

  get size() {
    return this._size
  }

  get jsonData() {
    return {
      ...super.jsonData,
      children: this.children.map(child => child.jsonData),
      backgroundColor: this.backgroundColor,
      constraints: this.constraints,
    }
  }
}
