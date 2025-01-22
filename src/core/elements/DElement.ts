import { customAlphabet } from 'nanoid'
import { Container, PointData } from 'pixi.js'

import { DesignApplication } from '../DesignApplication'

export interface IDElementBase {
  id?: string
  name?: string
  type: string
  index?: number
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  locked?: boolean
  hidden?: boolean
}

export interface IDElement extends IDElementBase {
  items?: IDElement[]
}

export interface IDElementInstance<Item extends Container> extends IDElementBase {
  app: DesignApplication
  displayName: string
  boundX: number
  boundY: number
  boundWidth: number
  boundHeight: number
  item: Item
  children?: IDElementInstance<any>[]
  globalPosition: PointData
  jsonData: IDElementBase
  locked?: boolean
  hidden?: boolean
  isSelected?: boolean
  isHovered?: boolean
  isDraging?: boolean
}

export function eid(): string {
  const nanoid = customAlphabet('1234567890abcdef', 16)

  return nanoid()
}
