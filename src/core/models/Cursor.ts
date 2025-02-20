import { makeObservable, observable, action, computed } from 'mobx'

import { Position } from '../events'

import { Engine } from './Engine'

export enum CursorStatus {
  Normal = 'normal',
  DragStart = 'dragStart',
  Dragging = 'dragging',
  DragStop = 'dragStop',
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
  pageX: 0,
  pageY: 0,
  offsetX: 0,
  offsetY: 0,
}

const calcPositionDelta = (end: CursorPosition, start: CursorPosition): CursorPosition => {
  return {
    clientX: end.clientX - start.clientX,
    clientY: end.clientY - start.clientY,
    pageX: end.pageX - start.pageX,
    pageY: end.pageY - start.pageY,
    offsetX: end.offsetX - start.offsetX,
    offsetY: end.offsetY - start.offsetY,
  }
}

export class Cursor {
  engine: Engine
  position: CursorPosition = DEFAULT_POSITION
  _type: CursorType = CursorType.Default
  status: CursorStatus = CursorStatus.Normal

  dragType: CursorDragType = CursorDragType.None
  dragStartPosition: CursorPosition = DEFAULT_POSITION
  dragEndPosition: CursorPosition = DEFAULT_POSITION
  dragAtomDelta: CursorPosition = DEFAULT_POSITION
  dragStartToCurrentDelta: CursorPosition = DEFAULT_POSITION
  dragStartToEndDelta: CursorPosition = DEFAULT_POSITION

  constructor(engine: Engine) {
    this.engine = engine
    makeObservable(this, {
      position: observable,
      status: observable,
      dragType: observable,
      dragStartPosition: observable,
      dragEndPosition: observable,
      type: computed,
      setType: action.bound,
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

  get type() {
    return this._type
  }

  set type(type: CursorType) {
    this.setType(type)
  }

  setType(type: CursorType) {
    this._type = type
    if (this.engine.app.canvas.style) {
      this.engine.app.canvas.style.cursor = type
    }
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
    console.log('setDragStart', position.offsetX, position.offsetY)
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
