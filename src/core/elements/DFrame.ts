import { makeObservable, observable, computed, action, IObservableArray, observe } from 'mobx'

import { DesignApplication } from '../DesignApplication'
import { Frame } from '../Frame'

import { DElement, IDElement } from './DElement'
import { IDElementInstance } from './DElement'

export interface DFrameOptions extends IDElement {
  app: DesignApplication
}

export interface IDFrame extends IDElement {
  type: 'Frame'
  items?: IDElement[]
}

export class DFrame extends DElement {
  declare item: Frame

  children: IObservableArray<DElement> = observable.array([])

  constructor(options: DFrameOptions) {
    super(options)
    makeObservable(this, {
      id: observable,
      name: observable,
      index: observable,
      children: observable,
      type: computed,
      displayName: computed,
      x: computed,
      y: computed,
      centerX: computed,
      centerY: computed,
      zoomRatio: computed,
      width: computed,
      height: computed,
      globalPosition: computed,
      rotation: computed,
      jsonData: computed,
      setRotation: action.bound,
      renderItems: action.bound,
      setZoom: action.bound,
    })
    this.item = new Frame({
      app: this.app,
      x: options.x,
      y: options.y,
      rotation: options.rotation ?? 0,
      width: options.width ?? 0,
      height: options.height ?? 0,
    })
    this.item.eventMode = 'static'

    this.setupChildrenObserver()
    this.renderItems(options.items)
  }

  get type() {
    return 'Frame'
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
      width: this.width / this.scale.x,
      height: this.height / this.scale.y,
      rotation: this.rotation,
      name: this.name,
      type: this.type,
      items: this.children.map(child => child.jsonData),
    }
  }
}
