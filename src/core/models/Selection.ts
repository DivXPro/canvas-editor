import { action, computed, makeObservable, observable } from 'mobx'

import { DGroup, DNode, eid, Position } from '../nodes'
import { SelectElementEvent, UnselectElementEvent } from '../events/mutation'
import { calculateBoundsFromPoints, mergeBounds } from '../utils/transform'
import { isArr } from '../utils/types'
import { isPointInPointsArea } from '../utils/hitConfirm'

import { Engine } from './Engine'
import { Workbench } from './Workbench'

export interface SelectionOptions {
  engine: Engine
  workbench: Workbench
  selected?: string[]
}

export class Selection {
  engine: Engine
  workbench: Workbench
  selected = observable.array<string>([])
  indexes: Record<string, boolean> = {}
  selecting = false

  constructor(options: SelectionOptions) {
    this.engine = options.engine
    this.workbench = options.workbench
    makeObservable(this, {
      selected: observable,
      indexes: observable,
      selectedNodes: computed,
      startPoint: computed,
      selectedDisplayRectPoints: computed,
      allowGroup: computed,
      allowUngroup: computed,
      select: action.bound,
      trigger: action.bound,
      add: action.bound,
      remove: action.bound,
      clear: action.bound,
      groupSelection: action.bound,
      ungroup: action.bound,
    })
    if (options.selected) {
      this.selected.clear().push(...options.selected)
    }
  }

  get allowGroup() {
    return this.selectedNodes.length > 1
  }

  get allowUngroup() {
    return this.selectedNodes.some(node => node.type === 'GROUP')
  }

  trigger(type = SelectElementEvent) {
    const event = new type({
      target: this.selectedNodes,
      source: this.selectedNodes,
    })

    this.engine.events.emit(event.type, event)
  }

  mapIds(ids: string | DNode | string[] | DNode[]) {
    return Array.isArray(ids) ? ids.map((node: string | DNode) => (typeof node === 'string' ? node : node?.id)) : []
  }

  select(ids: string | DNode | Array<string | DNode>): void {
    if (!isArr(ids)) {
      return this.select([ids])
    }
    if (isArr(ids) && ids.some(id => typeof id !== 'string')) {
      return this.select(
        ids.map(idOrNode => {
          if (typeof idOrNode === 'string') {
            return idOrNode
          } else {
            return idOrNode?.id
          }
        })
      )
    }

    const nodeIds = isArr(ids) ? (ids as string[]) : ([ids] as string[])

    if (this.selected.length === nodeIds.length && nodeIds.every(id => this.indexes[id])) {
      return
    }
    this.selected.clear()
    this.selected.push(...nodeIds)
    this.indexes = {}
    nodeIds.forEach(id => {
      this.indexes[id] = true
    })
    this.trigger(SelectElementEvent)
  }

  safeSelect(ids: string | DNode | Array<string | DNode>) {
    if (!ids) return
    this.select(ids)
  }

  get startPoint() {
    return this.engine.cursor.dragStartPosition
  }

  get selectedNodes() {
    return this.selected.map(id => this.engine.workbench.findById(id)).filter(node => node != null)
  }

  get first() {
    if (this.selected && this.selected.length) return this.selected[0]
  }

  get last() {
    if (this.selected && this.selected.length) {
      return this.selected[this.selected.length - 1]
    }
  }

  get length() {
    return this.selected.length
  }

  get absoluteBoundingBox() {
    return mergeBounds(this.selectedNodes.map(node => node.absoluteBoundingBox))
  }

  get selectedDisplayRectPoints(): Position[] {
    if (this.selectedNodes.length === 1) {
      return this.selectedNodes[0].absDisplayVertices
    }
    if (this.selectedNodes.length > 1) {
      const nodeRects = this.selectedNodes.map(node => node.absDisplayVertices)

      const boundPoints: Position[] = []

      nodeRects.map(rectPoint => {
        boundPoints.push(...rectPoint)
      })

      const bounds = calculateBoundsFromPoints(boundPoints)

      return [
        { x: bounds.x, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
        { x: bounds.x, y: bounds.y + bounds.height },
      ]
    }

    return []
  }

  rectContainsPoint(point: Position) {
    return isPointInPointsArea(point, this.selectedDisplayRectPoints)
  }

  containsPoint(point: Position) {
    if (this.selected.length === 0) {
      return false
    }
    for (let i = 0; i < this.selectedNodes.length; i++) {
      const node = this.selectedNodes[i]

      if (node.containsPoint(point)) {
        return true
      }
    }

    return false
  }

  add(...ids: string[] | DNode[]) {
    this.mapIds(ids).forEach(id => {
      if (!this.selected.includes(id)) {
        this.selected.push(id)
        this.indexes[id] = true
      }
    })
    this.trigger()
  }

  remove(...ids: string[] | DNode[]) {
    this.mapIds(ids).forEach(id => {
      this.selected.push(...this.selected.filter(item => item !== id))
      delete this.indexes[id]
    })
    this.trigger(UnselectElementEvent)
  }

  has(...ids: string[] | DNode[]): boolean {
    return this.mapIds(ids).some(id => {
      return this.indexes[id]
    })
  }

  clear() {
    this.selectedNodes.forEach(node => {
      node.hideOutline()
    })
    this.selected.clear()
    this.indexes = {}
    this.trigger(UnselectElementEvent)
  }

  groupSelection(nodes?: DNode[]): DGroup[] {
    if (this.selectedNodes.length === 0 && nodes?.length === 0) return []

    if (nodes) {
      const groupNodes = nodes.sort((a, b) => {
        return a.index - b.index
      })

      const bounds = this.absoluteBoundingBox

      const groudIndex = groupNodes[nodes.length - 1].index

      const parent = nodes[0].parent
      const position = parent?.item
        ? parent.item?.toLocal({ x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 })
        : { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 }

      const group = new DGroup({
        engine: this.engine,
        id: eid(),
        name: 'Group',
        type: 'GROUP',
        parent,
        position,
        size: { width: bounds.width, height: bounds.height },
      })

      if (parent != null) {
        parent.addChildAt(group, Math.min(parent.children.length - 1, groudIndex))
      } else {
        this.engine.app.stage.addChildAt(group.item, Math.min(this.engine.app.stage.children.length - 1, groudIndex))
        this.workbench.canvaNodes.push(group)
      }

      groupNodes.forEach(node => {
        if (node.parent == null) {
          this.workbench.canvaNodes.splice(this.workbench.canvaNodes.indexOf(node), 1)
        }
        if (node.item && node.item.parent) {
          node.joinGroup(group)
        }
      })

      return [group]
    } else {
      if (this.selectedNodes.length < 1) return []
      // 按父节点分组
      const nodesByParent = new Map<any, DNode[]>()

      this.selectedNodes.forEach(node => {
        const parentKey = node.item?.parent || 'root'

        if (!nodesByParent.has(parentKey)) {
          nodesByParent.set(parentKey, [])
        }
        nodesByParent.get(parentKey)?.push(node)
      })
      // 为每个分组创建新的组
      const groups: DGroup[] = []

      nodesByParent.forEach(groupNodes => {
        if (groupNodes.length > 1) {
          groups.push(...this.groupSelection(groupNodes))
        }
      })
      this.clear()
      this.select(groups)

      return groups
    }
  }

  ungroup() {
    const newSelectedNodes: DNode[] = []

    this.selectedNodes.forEach(node => {
      if (node.type === 'GROUP' && node instanceof DGroup) {
        newSelectedNodes.push(...node.children)
        node.ungroup()
      } else {
        newSelectedNodes.push(node)
      }
    })
    this.clear()
    this.select(newSelectedNodes)
  }
}
