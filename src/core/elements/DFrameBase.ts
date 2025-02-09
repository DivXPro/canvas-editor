import { makeObservable, observable, action, observe, IObservableArray, override } from 'mobx'

import { Engine } from '../Engine'

import { DNode, IDNode, INodeBase } from './DNode'
import { Size, Color, LayoutConstraint } from './type'

export interface IDFrameBaseBase extends INodeBase {
  children?: INodeBase[]
  size: Size
  backgroundColor: Color
  constraints?: LayoutConstraint
  clipsContent?: boolean
}

export interface DFrameBaseOptions extends IDFrameBaseBase {
  engine: Engine
  parent?: DNode
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
      renderItems: action.bound,
    })
  }

  protected initChildren(items?: INodeBase[]) {
    this.setupChildrenObserver()
    if (items) {
      this.renderItems(items)
    }
  }

  renderItems(items: INodeBase[] = []) {
    items
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
      .forEach(item => {
        const child = this.engine.operation?.generateElement(item, this)

        child && this.children.push(child)
      })
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

  onElementsAdded(elements: IDNode<any>[]) {
    // 处理添加元素的逻辑
    elements.forEach(element => {
      // 例如，将元素添加到 Frame 中
      this.item?.addChild(element.item)
    })
  }

  onElementsRemoved(elements: IDNode<any>[]) {
    // 处理移除元素的逻辑
    elements.forEach(element => {
      // 例如，从 Frame 中移除元素
      this.item?.removeChild(element.item)
    })
  }

  moveTo(point: { x: number; y: number }) {
    this.item?.position.set(point.x, point.y)
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
