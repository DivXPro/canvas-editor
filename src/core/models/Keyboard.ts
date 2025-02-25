import { action, computed, makeObservable, observable } from 'mobx'

import { KeyCode } from '../utils/keycode'
import { IEngineContext } from '../types'
import { AbstractKeyboardEvent } from '../events/keyboard/AbstractKeyboardEvent'

import { Engine } from './Engine'
import { Shortcut } from './Shortcut'

const Modifiers: [string, KeyCode][] = [
  ['metaKey', KeyCode.Meta],
  ['shiftKey', KeyCode.Shift],
  ['ctrlKey', KeyCode.Control],
  ['altKey', KeyCode.Alt],
]

export interface IKeyboard {
  engine: Engine
}

export class Keyboard {
  engine: Engine
  sequence: KeyCode[] = []
  keyDown: KeyCode | null = null
  modifiers = {}
  requestTimer: NodeJS.Timeout | null = null

  constructor(engine: Engine) {
    this.engine = engine

    makeObservable(this, {
      sequence: observable.shallow,
      keyDown: observable.ref,
      shortcuts: computed,
      handleKeyboard: action.bound,
    })
  }

  get shortcuts() {
    return this.engine.shortcuts
  }

  matchCodes(context: IEngineContext) {
    for (let i = 0; i < this.shortcuts.length; i++) {
      const shortcut = this.shortcuts[i]

      if (shortcut.match(this.sequence, context)) {
        return true
      }
    }

    return false
  }

  preventCodes() {
    return this.shortcuts.some(shortcut => {
      return shortcut.preventCodes(this.sequence)
    })
  }

  includes(key: KeyCode) {
    return this.sequence.some(code => Shortcut.matchCode(code, key))
  }

  excludes(key: KeyCode) {
    this.sequence = this.sequence.filter(code => !Shortcut.matchCode(key, code))
  }

  addKeyCode(key: KeyCode) {
    if (!this.includes(key)) {
      this.sequence.push(key)
    }
  }

  removeKeyCode(key: KeyCode) {
    if (this.includes(key)) {
      this.excludes(key)
    }
  }

  isModifier(code: KeyCode) {
    return Modifiers.some(modifier => Shortcut.matchCode(modifier[1], code))
  }

  handleModifiers(event: AbstractKeyboardEvent) {
    Modifiers.forEach(([key, code]) => {
      // 使用类型断言来访问动态属性
      if ((event as unknown as Record<string, boolean>)[key]) {
        if (!this.includes(code)) {
          this.sequence = [code].concat(this.sequence)
        }
      }
    })
  }

  handleKeyboard(event: AbstractKeyboardEvent, context: IEngineContext) {
    if (event.eventType === 'keydown') {
      this.keyDown = event.data
      this.addKeyCode(this.keyDown)
      this.handleModifiers(event)
      if (this.matchCodes(context)) {
        this.sequence = []
      }
      this.requestClean(4000)
      if (this.preventCodes()) {
        event.preventDefault()
        event.stopPropagation()
      }
    } else {
      if (this.isModifier(event.data)) {
        this.sequence = []
      }
      this.keyDown = null
    }
  }

  isKeyDown(code: KeyCode) {
    return this.keyDown === code
  }

  requestClean(duration = 320) {
    if (this.requestTimer != null) {
      clearTimeout(this.requestTimer)
    }
    this.requestTimer = setTimeout(() => {
      this.keyDown = null
      this.sequence = []
      if (this.requestTimer) {
        clearTimeout(this.requestTimer)
      }
    }, duration)
  }
}
