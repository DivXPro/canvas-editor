import { action, computed, makeObservable, observable } from 'mobx'

import { DGroup, DNode, eid, Position } from '../nodes'
import { SelectNodeEvent, UnselectNodeEvent } from '../events/mutation'
import { calculateBoundsFromPoints, mergeBounds } from '../utils/transform'
import { isArr } from '../utils/types'
import { isPointInPointsArea } from '../utils/hitConfirm'
import { GroupCommand } from '../commands/GroupCommand'
import { CompositeCommand } from '../commands'
import { UngroupCommand } from '../commands/UngroupCommand'

import { Engine } from './Engine'
import { Workspace } from './Workspace'

export interface SelectionOptions {
  engine: Engine
  workbench: Workspace
  selected?: string[]
}

export class Selection {
  engine: Engine
  workbench: Workspace
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

  trigger(type = SelectNodeEvent) {
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
    this.trigger(SelectNodeEvent)
  }

  safeSelect(ids: string | DNode | Array<string | DNode>) {
    if (!ids) return
    this.select(ids)
  }

  get startPoint() {
    return this.engine.cursor.dragStartPosition
  }

  get selectedNodes() {
    return this.selected.map(id => this.engine.workspace.findById(id)).filter(node => node != null)
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
      this.selected.splice(this.selected.indexOf(id), 1)
      delete this.indexes[id]
    })
    this.trigger(UnselectNodeEvent)
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
    this.trigger(UnselectNodeEvent)
  }

  groupSelection() {
    if (this.selectedNodes.length < 1) return
    // 按父节点分组
    const nodesByParent = new Map<any, DNode[]>()

    this.selectedNodes.forEach(node => {
      const parentKey = node.item?.parent || 'root'

      if (!nodesByParent.has(parentKey)) {
        nodesByParent.set(parentKey, [])
      }
      nodesByParent.get(parentKey)?.push(node)
    })

    this.clear()
    const command = new CompositeCommand({
      timestamp: Date.now(),
    })

    nodesByParent.forEach(groupNodes => {
      if (groupNodes.length > 1) {
        const cmd = this.groupNodes(groupNodes)

        if (cmd) {
          command.add(cmd)
        }
      }
    })
    if (command.subCommands.length > 0) {
      this.engine.workspace.history.push(command)
    }
  }

  groupNodes(nodes: DNode[]) {
    if (nodes && nodes.length > 0) {
      const groupNodes = nodes.sort((a, b) => {
        return a.index - b.index
      })

      const nodePrevStates = groupNodes.map(node => ({
        id: node.id,
        index: node.index,
      }))

      const bounds = mergeBounds(groupNodes.map(node => node.absoluteBoundingBox))

      const groudIndex = groupNodes[nodes.length - 1].index

      const parent = nodes[0].parent
      const position = parent?.item
        ? parent.item?.toLocal({ x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 })
        : { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 }

      const group = new DGroup(this.engine, {
        id: eid(),
        name: 'Group',
        type: 'GROUP',
        parentId: parent?.id,
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

      this.add(group)

      const prevStates = {
        group: group.serialize(),
        nodes: nodePrevStates,
      }

      const states = {
        group: group.serialize(),
        nodes: groupNodes.map(node => ({
          id: node.id,
          index: node.index,
          parent: node.parent?.id,
        })),
      }

      const command = new GroupCommand(group, this.engine, states, prevStates)

      return command
    }
  }

  ungroup() {
    const newSelectedNodes: DNode[] = []
    const command = new CompositeCommand({
      timestamp: Date.now(),
    })

    this.selectedNodes.forEach(node => {
      if (node.type === 'GROUP' && node instanceof DGroup) {
        // 记录组的状态信息
        const childNodes = node.children.slice()

        const prevStates = {
          group: node.serialize(),
          childNodeStates: childNodes.map(child => ({
            id: child.id,
            index: child.index,
          })),
        }

        newSelectedNodes.push(...node.children)
        node.ungroup()

        const states = {
          group: node.serialize(),
          childNodeStates: childNodes.map(child => ({
            id: child.id,
            index: child.index,
          })),
        }
        // 创建 UngroupCommand 并添加到组合命令中
        const ungroupCommand = new UngroupCommand(node, this.engine, prevStates, states)

        command.add(ungroupCommand)
      } else {
        newSelectedNodes.push(node)
      }
    })

    if (command.subCommands.length > 0) {
      this.engine.workspace.history.push(command)
    }

    this.clear()
    this.select(newSelectedNodes)
  }
}
