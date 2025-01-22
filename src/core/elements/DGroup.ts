import { Container } from 'pixi.js'
import { makeObservable, observable, computed, action, observe, IObservableArray } from 'mobx'

import { DesignApplication } from '../DesignApplication'

import { eid, IDElement, IDElementInstance } from './DElement'

export interface IDGroup extends IDElement {
  type: 'Group'
}

export interface DGroupOptions extends IDGroup {
  app: DesignApplication
}

export class DGroup implements IDElementInstance<Container> {
  app: DesignApplication
  id: string
  name?: string
  index: number = 0
  item: Container
  locked?: boolean
  isHovered?: boolean
  isSelected?: boolean
  children: IObservableArray<IDElementInstance<any>> = observable.array([])

  constructor(options: DGroupOptions) {
    this.app = options.app
    makeObservable(this, {
      id: observable,
      name: observable,
      index: observable,
      locked: observable,
      children: observable,
      hidden: computed,
      type: computed,
      displayName: computed,
      x: computed,
      y: computed,
      width: computed,
      height: computed,
      boundX: computed,
      boundY: computed,
      boundWidth: computed,
      boundHeight: computed,
      rotation: computed,
      globalPosition: computed,
      jsonData: computed,
      setRotation: action.bound,
      setBoundX: action.bound,
      setBoundY: action.bound,
      setHidden: action.bound,
      renderItems: action.bound,
    })
    this.id = options.id ?? eid()
    this.locked = options.locked
    this.item = new Container({
      x: options.x,
      y: options.y,
      rotation: options.rotation ?? 0,
      width: options.width,
      height: options.height,
      pivot: { x: options.width / 2, y: options.height / 2 },
      visible: !options.hidden,
    })
    this.setupChildrenObserver()
    this.renderItems(options.items)
  }

  get type() {
    return 'Group'
  }

  get displayName() {
    return this.name ?? 'Group'
  }

  get x() {
    return this.item.x
  }

  get y() {
    return this.item.y
  }

  get width() {
    return this.item.width
  }

  get height() {
    return this.item.height
  }

  get boundX() {
    return this.item.getBounds().x
  }

  get boundY() {
    return this.item.getBounds().y
  }

  get boundWidth() {
    return this.item.getBounds().width
  }

  get boundHeight() {
    return this.item.getBounds().height
  }


  get boundCenter() {
    return { x: this.x + this.boundWidth / 2, y: this.y + this.boundHeight / 2 }
  }

  get globalPosition() {
    return this.item.getGlobalPosition()
  }

  get rotation() {
    return this.item.rotation
  }

  get hidden() {
    return !this.item.visible
  }

  set hidden(value: boolean) {
    this.setHidden(value)
  }

  setHidden(value: boolean) {
    this.item.visible = !value
  }

  setRotation(rotation: number) {
    this.item.rotation = rotation
  }

  setBoundX(x: number) {
    this.item.x += x - this.boundX
  }

  setBoundY(y: number) {
    this.item.x += y - this.boundY
  }

  renderItems(items: IDElement[] = []) {
    items
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
      .forEach(item => {
        const child = this.app.generateElement(item)

        child && this.children.push(child)
      })
  }

  protected setupChildrenObserver() {
    observe(this.children, change => {
      if (change.type === 'splice') {
        if (change.added.length > 0) {
          console.log('Elements added:', change.added)
          // 在这里处理添加元素的逻辑
          this.onElementsAdded(change.added)
        }
        if (change.removed.length > 0) {
          console.log('Elements removed:', change.removed)
          // 在这里处理移除元素的逻辑
          this.onElementsRemoved(change.removed)
        }
      }
    })
  }

  private onElementsAdded(elements: IDElementInstance<any>[]) {
    // 处理添加元素的逻辑
    elements.forEach(element => {
      // 例如，将元素添加到 Frame 中
      this.item.addChild(element.item)
    })
  }

  private onElementsRemoved(elements: IDElementInstance<any>[]) {
    // 处理移除元素的逻辑
    elements.forEach(element => {
      // 例如，从 Frame 中移除元素
      this.item.removeChild(element.item)
    })
  }

  moveTo(point: { x: number, y: number }) {
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
      items: this.children.map(child => child.jsonData)
    }
  }
}

