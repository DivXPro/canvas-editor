import { Container } from 'pixi.js'
import { makeObservable, observable, action, observe, IObservableArray, override } from 'mobx'

import { Engine } from '../Engine'

import { DElement, IDElement, IDElementInstance } from './DElement'

export interface IDGroup extends IDElement { }

export interface DGroupOptions extends IDGroup {
  engine: Engine
  parent?: DElement
  width?: number
  height?: number
}

export class DGroup extends DElement {
  item: Container
  children: IObservableArray<DElement> = observable.array([])

  constructor(options: DGroupOptions) {
    super(options)
    makeObservable(this, {
      type: override,
      jsonData: override,
      displayName: override,
      children: observable.ref,
      renderItems: action.bound,
    })
    this.item = new Container({
      x: options.x,
      y: options.y,
      rotation: options.rotation ?? 0,
      width: options.width,
      height: options.height,
      visible: !options.hidden,
    })
  }

  get type() {
    return 'Group'
  }

  get displayName() {
    return this.name ?? 'Group'
  }

  init(items?: IDElement[]) {
    this.setupChildrenObserver()
    if (items) {
      this.renderItems(items)
    }
  }

  renderItems(items: IDElement[] = []) {
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

  onElementsAdded(elements: IDElementInstance<any>[]) {
    // 处理添加元素的逻辑
    elements.forEach(element => {
      // 例如，将元素添加到 Frame 中
      this.item.addChild(element.item)
    })
  }

  onElementsRemoved(elements: IDElementInstance<any>[]) {
    // 处理移除元素的逻辑
    elements.forEach(element => {
      // 例如，从 Frame 中移除元素
      this.item.removeChild(element.item)
    })
  }

  moveTo(point: { x: number; y: number }) {
    this.item.position.set(point.x, point.y)
  }

  get jsonData() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      locked: this.locked,
      hidden: this.hidden,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      rotation: this.rotation,
      items: this.children.map(child => child.jsonData),
    }
  }
}
