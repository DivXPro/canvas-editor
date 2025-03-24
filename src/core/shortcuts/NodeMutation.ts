import { Shortcut } from '../models/Shortcut'
import { DNode } from '../nodes'
import { KeyCode } from '../utils/keycode'

export const DeleteNodes = new Shortcut({
  codes: [[KeyCode.Backspace], [KeyCode.Delete]],
  handler(context) {
    const workbench = context?.workspace

    if (workbench) {
      workbench.selection.selectedNodes.forEach(node => {
        node.delete()
      })
    }
  },
})

interface IClipboard {
  nodes: DNode[]
}

const Clipboard: IClipboard = {
  nodes: [],
}

export const CopyNodes = new Shortcut({
  codes: [
    [KeyCode.Meta, KeyCode.C],
    [KeyCode.Control, KeyCode.C],
  ],
  handler(context) {
    const workbench = context?.workspace

    if (workbench) {
      Clipboard.nodes = workbench.selection.selectedNodes
    }
  },
})

export const PasteNodes = new Shortcut({
  codes: [
    [KeyCode.Meta, KeyCode.V],
    [KeyCode.Control, KeyCode.V],
  ],
  handler(context) {
    const workbench = context?.workspace

    if (workbench) {
      DNode.Clone(Clipboard.nodes)
    }
  },
})
