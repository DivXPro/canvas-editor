import { action, computed, makeObservable, observable } from 'mobx'

import { CompositeCommand } from '../commands'

export interface IHistoryProps<T = CompositeCommand> {
  onPush?: (item: T) => void
  onRedo?: (item: T) => void
  onUndo?: (item: T) => void
}

export interface ISerializable {
  from(json: any): void //导入数据
  serialize(): any //序列化模型，用于历史记录保存
}

export class History {
  current = 0
  history = observable.array<CompositeCommand>([])
  props?: IHistoryProps
  updateTimer = null
  maxSize = 100
  locking = false

  constructor(props?: IHistoryProps) {
    this.props = props
    makeObservable(this, {
      current: observable.ref,
      history: observable.shallow,
      allowUndo: computed,
      allowRedo: computed,
      push: action.bound,
      undo: action.bound,
      redo: action.bound,
      clear: action.bound,
    })
  }

  list() {
    return this.history
  }

  push(command: CompositeCommand) {
    if (this.locking) return
    if (this.current < this.history.length) {
      this.history.splice(this.current - 1)
    }

    this.history.push(command)

    const overSizeCount = this.history.length - this.maxSize

    if (overSizeCount > 0) {
      this.history.splice(0, overSizeCount)
    }
    this.current = this.history.length
    if (this.props?.onPush) {
      this.props.onPush(command)
    }
  }

  get allowUndo() {
    return this.history.length > 0 && this.current - 1 >= 0
  }

  get allowRedo() {
    return this.history.length > this.current
  }

  redo() {
    if (this.allowRedo) {
      const cmd = this.history[this.current]

      this.locking = true
      this.current++
      cmd.redo()
      this.locking = false
      if (this.props?.onRedo) {
        this.props.onRedo(cmd)
      }
    }
  }

  undo() {
    if (this.allowUndo) {
      const cmd = this.history[this.current - 1]

      this.locking = true
      cmd.undo()
      this.current--
      this.locking = false
      if (this.props?.onUndo) {
        this.props.onUndo(cmd)
      }
    }
  }

  clear() {
    this.history.splice(0, this.history.length)
    this.current = 0
  }
}
