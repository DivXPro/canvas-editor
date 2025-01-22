import { makeObservable, observable, computed, action, IObservableArray, observe } from 'mobx'

import { DesignApplication } from '../DesignApplication'
import { Frame } from '../Frame'

import { eid, IDElement } from './DElement'
import { IDElementInstance } from './DElement'

export interface DFrameOptions extends IDElement {
  app: DesignApplication
}

export interface IDFrame extends IDElement {
  type: 'Frame'
  items?: IDElement[]
}

export class DFrame implements IDElementInstance<Frame> {
  declare item: Frame

  app: DesignApplication
  id: string
  name?: string
  index: number = 0
  isHovered?: boolean
  isSelected?: boolean
  children: IObservableArray<IDElementInstance<any>> = observable.array([])

  constructor(options: DFrameOptions) {
    this.app = options.app

    makeObservable(this, {
      id: observable,
      name: observable,
      index: observable,
      children: observable,
      type: computed,
      displayName: computed,
      x: computed,
      y: computed,
      zoomRatio: computed,
      width: computed,
      height: computed,
      boundX: computed,
      boundY: computed,
      boundWidth: computed,
      boundHeight: computed,
      globalPosition: computed,
      rotation: computed,
      jsonData: computed,
      setRotation: action.bound,
      renderItems: action.bound,
      setZoom: action.bound,
    })
    this.id = options.id ?? eid()
    this.item = new Frame({
      app: this.app,
      x: options.x,
      y: options.y,
      rotation: options.rotation ?? 0,
      width: options.width,
      height: options.height,
    })
    this.item.eventMode = 'static'
    this.setupChildrenObserver()
    this.renderItems(options.items)
  }

  get type() {
    return 'Frame'
  }

  get displayName() {
    return this.name ?? 'Frame'
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

  setRotation(rotation: number) {
    this.item.rotation = rotation
  }

  get zoomRatio() {
    return this.item.scale.x
  }

  set zoomRatio(zoom: number) {
    this.setZoom(zoom)
  }

  setZoom(zoom: number) {
    this.item.zoomRatio = zoom
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

  private onElementsAdded(elements: IDElementInstance<any>[]) {
    // 处理添加元素的逻辑
    elements.forEach(element => {
      // 例如，将元素添加到 Frame 中
      console.debug('Element add:', element.item.name, element.item)

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

  get jsonData() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      rotation: this.rotation,
      name: this.name,
      type: this.type,
      items: this.children.map(child => child.jsonData),
    }
  }
}
