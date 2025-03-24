import { observable, makeObservable } from 'mobx'

import { globalThisPolyfill } from '../utils/globalThisPolyfill'
import { Position } from '../nodes'
import { ViewChangeEvent, ZoomChangeEvent } from '../events/'

import { Engine } from './Engine'
import { Workspace } from './Workspace'

export interface IViewportProps {
  viewportElement: HTMLElement
  zoomRatio?: number
  minZoom?: number
  maxZoom?: number
  zoomRatioStep?: number
  enableZoom?: boolean
  contentWindow: Window
  nodeIdAttrName: string
  moveSensitive?: boolean
  moveInsertionType?: IViewportMoveInsertionType
}

export interface IViewportData {
  scrollX?: number
  scrollY?: number
  width?: number
  height?: number
}

export type IViewportMoveInsertionType = 'all' | 'inline' | 'block'

/**
 * 视口模型
 */
export class Viewport {
  workspace: Workspace

  engine: Engine

  contentWindow?: Window

  viewportElement?: HTMLElement

  dragStartSnapshot?: IViewportData

  scrollX = 0

  scrollY = 0

  width = 0

  height = 0

  zoomRatio = 1

  minZoom = 0.5

  maxZoom = 2

  zoomRatioStep = 0.1

  enableZoom = true

  mounted = false

  attachRequest?: number

  nodeIdAttrName?: string

  moveSensitive?: boolean

  moveInsertionType?: IViewportMoveInsertionType

  nodeElementsStore: Record<string, HTMLElement[]> = {}

  constructor(workspace: Workspace) {
    this.workspace = workspace
    this.engine = this.workspace.engine
  }

  init(props: IViewportProps) {
    this.zoomRatio = props.zoomRatio ?? this.zoomRatio
    this.minZoom = props.minZoom ?? this.minZoom
    this.maxZoom = props.maxZoom ?? this.maxZoom
    this.zoomRatioStep = props.zoomRatioStep ?? this.zoomRatioStep
    this.enableZoom = props.enableZoom ?? this.enableZoom
    this.moveSensitive = props.moveSensitive ?? false
    this.moveInsertionType = props.moveInsertionType ?? 'all'
    this.viewportElement = props.viewportElement
    this.contentWindow = props.contentWindow
    this.nodeIdAttrName = props.nodeIdAttrName
    makeObservable(this, {
      scrollX: observable.ref,
      scrollY: observable.ref,
      width: observable.ref,
      height: observable.ref,
      viewportElement: observable.ref,
      contentWindow: observable.ref,
    })
    // 添加触摸板缩放事件监听
    this.setupZoomHandlers()
  }

  get isScrollLeft() {
    return this.scrollX === 0
  }

  get isScrollTop() {
    return this.scrollY === 0
  }

  get isScrollRight() {
    if (this.isIframe && this.contentWindow) {
      return this.width + this.contentWindow.scrollX >= this.contentWindow?.document?.body?.scrollWidth
    } else if (this.viewportElement) {
      return this.viewportElement.offsetWidth + this.scrollX >= this.viewportElement.scrollWidth
    }
  }

  get isScrollBottom() {
    if (this.isIframe) {
      if (!this.contentWindow?.document?.body) return false

      return this.height + this.contentWindow.scrollY >= this.contentWindow.document.body.scrollHeight
    } else if (this.viewportElement) {
      if (!this.viewportElement) return false

      return this.viewportElement.offsetHeight + this.viewportElement.scrollTop >= this.viewportElement.scrollHeight
    }
  }

  get viewportRoot() {
    return this.isIframe ? this.contentWindow?.document?.body : this.viewportElement
  }

  get isMaster() {
    return this.contentWindow === globalThisPolyfill
  }

  get isIframe() {
    return !!this.contentWindow?.frameElement && !this.isMaster
  }

  get scrollContainer() {
    return this.isIframe ? this.contentWindow : this.viewportElement
  }

  get rect() {
    const viewportElement = this.viewportElement

    if (viewportElement) return viewportElement.getBoundingClientRect()
  }

  get innerRect() {
    const rect = this.rect

    return { x: 0, y: 0, width: rect?.width ?? 0, height: rect?.height ?? 0 }
  }

  get offsetX() {
    const rect = this.rect

    if (!rect) return 0

    return rect.x
  }

  get offsetY() {
    const rect = this.rect

    if (!rect) return 0

    return rect.y
  }

  get scale() {
    if (!this.viewportElement) return 1
    const clientRect = this.viewportElement.getBoundingClientRect()
    const offsetWidth = this.viewportElement.offsetWidth

    if (!clientRect.width || !offsetWidth) return 1

    return Math.round(clientRect.width / offsetWidth)
  }

  setupZoomHandlers() {
    if (!this.viewportElement) return

    this.viewportElement.addEventListener('wheel', this.handleWheel, { passive: false })
  }

  handleWheel = (event: WheelEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (this.viewportElement) {
      const isZoomGesture = event.ctrlKey || event.metaKey

      if (isZoomGesture) {
        // 使用 requestAnimationFrame 优化性能
        requestAnimationFrame(() => {
          // 计算缩放因子
          const delta = -event.deltaY
          const zoomFactor = 1 + delta * 0.001

          // 获取鼠标位置作为缩放中心点
          const rect = this.viewportElement?.getBoundingClientRect()
          const point = {
            x: event.clientX - (rect?.left ?? 0),
            y: event.clientY - (rect?.top ?? 0),
          }

          // 执行缩放
          this.zoomAt(zoomFactor, point)
        })
      } else {
        // 计算滚动偏移量
        const deltaX = event.deltaX
        const deltaY = event.deltaY

        this.move(deltaX, deltaY)
        // 清除悬停状态
        this.workspace.hover.clear()
      }
    }
  }

  zoomAt(factor: number, point: Position) {
    // 调用 workbench 的缩放方法
    const currentZoom = this.zoomRatio
    const newZoom = Math.max(0.1, Math.min(2, currentZoom * factor))

    this.zoomRatio = newZoom
    this.workspace.hover.clear()
    this.engine.dispatch(new ZoomChangeEvent({ zoomRatio: this.zoomRatio }))
    //TODO: 可以在这里添加缩放中心点的逻辑
  }

  move(deltaX: number, deltaY: number) {
    this.engine.stage.position.x -= deltaX
    this.engine.stage.position.y -= deltaY

    this.engine.dispatch(new ViewChangeEvent({ position: this.engine.stage.position }))
    // 清除悬停状态
    this.workspace.hover.clear()
  }

  // 在组件销毁时清理事件监听
  cleanup() {
    if (this.viewportElement) {
      this.viewportElement.removeEventListener('wheel', this.handleWheel)
    }
  }
}
