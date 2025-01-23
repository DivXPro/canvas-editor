import { makeObservable, observable, action } from 'mobx'

import { DesignApplication } from './DesignApplication'
import { Position } from './events'

export enum CursorStatus {
  Normal = 'normal',
  Dragging = 'dragging',
  Resizing = 'resizing',
  Drawing = 'drawing',
}

export enum CursorDragType {
  Move = 'move',
  Resize = 'resize',
  Rotate = 'rotate',
  Scale = 'scale',
  Translate = 'translate',
  Round = 'round',
  None = 'none',
}

export enum CursorType {
  Default = 'default',
  Pointer = 'pointer',
  Move = 'move',
  Crosshair = 'crosshair',
  Text = 'text',
  NotAllowed = 'not-allowed',
  EwResize = 'ew-resize',
  NsResize = 'ns-resize',
  NeswResize = 'nesw-resize',
  NwseResize = 'nwse-resize',
}

export type CursorPosition = Position

const DEFAULT_POSITION: CursorPosition = {
  clientX: 0,
  clientY: 0,
  topClientX: 0,
  topClientY: 0,
  pageX: 0,
  pageY: 0,
  topPageX: 0,
  topPageY: 0,
  canvasX: 0,
  canvasY: 0,
}

const calcPositionDelta = (end: CursorPosition, start: CursorPosition): CursorPosition => {
  return {
    clientX: end.clientX - start.clientX,
    clientY: end.clientY - start.clientY,
    topClientX: end.topClientX - start.topClientX,
    topClientY: end.topClientY - start.topClientY,
    pageX: end.pageX - start.pageX,
    pageY: end.pageY - start.pageY,
    topPageX: end.topPageX - start.topPageX,
    topPageY: end.topPageY - start.topPageY,
    canvasX: end.canvasX - start.canvasX,
    canvasY: end.canvasY - start.canvasY,
  }
}

export class Cursor {
  app: DesignApplication
  position: CursorPosition = DEFAULT_POSITION
  type: CursorType = CursorType.Default
  status: CursorStatus = CursorStatus.Normal

  dragType: CursorDragType = CursorDragType.None
  dragStartPosition: CursorPosition = DEFAULT_POSITION
  dragEndPosition: CursorPosition = DEFAULT_POSITION
  dragAtomDelta: CursorPosition = DEFAULT_POSITION
  dragStartToCurrentDelta: CursorPosition = DEFAULT_POSITION
  dragStartToEndDelta: CursorPosition = DEFAULT_POSITION

  constructor(app: DesignApplication) {
    this.app = app
    makeObservable(this, {
      position: observable,
      status: observable,
      dragType: observable,
      dragStartPosition: observable,
      dragEndPosition: observable,
      type: observable,
      setPosition: action.bound,
      setStatus: action.bound,
      setDragType: action.bound,
      setDragStart: action.bound,
      setDragEnd: action.bound,
      setDragAtomDelta: action.bound,
      setDragStartToCurrentDelta: action.bound,
      setDragStartToEndDelta: action.bound,
    })
  }

  setPosition(position: CursorPosition) {
    this.dragAtomDelta = calcPositionDelta(this.position, position)
    this.position = { ...position }
    if (this.status === CursorStatus.Dragging) {
      this.dragStartToCurrentDelta = calcPositionDelta(this.position, this.dragStartPosition)
    }
  }

  setStatus(status: CursorStatus) {
    this.status = status
  }

  setDragType(type: CursorDragType) {
    this.dragType = type
  }

  setDragStart(position: CursorPosition) {
    this.dragStartPosition = position
  }

  setDragEnd(position: CursorPosition) {
    this.dragEndPosition = position
  }

  setDragAtomDelta(delta: CursorPosition) {
    this.dragAtomDelta = delta
  }

  setDragStartToCurrentDelta(delta: CursorPosition) {
    this.dragStartToCurrentDelta = delta
  }

  setDragStartToEndDelta(delta: CursorPosition) {
    this.dragStartToEndDelta = delta
  }
}
