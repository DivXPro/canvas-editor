import React, { useEffect, useRef } from 'react'

import { Engine } from '../core/models/Engine'
import { demoData } from '../mock/demo'
import { EditorEngineContext } from '../context'

import { CanvasMenu } from './canvasMenu'

export type EditorContextValue = {
  engine: Engine | null
}

export interface EditorProps {
  canvasScope?: any
  engine: Engine
}

export const CanvasEditor: React.FC<EditorProps> = ({ engine }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initApp = async () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()

        await engine.init({
          background: 0xdfdfdf,
          resizeTo: containerRef.current,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
          enableZoom: true,
          data: demoData,
          canvasSize: { width, height },
        })
      }

      if (containerRef.current) {
        containerRef.current.appendChild(engine.app.canvas)
      }
    }

    initApp()
  }, [])

  return (
    <EditorEngineContext.Provider value={engine}>
      <CanvasMenu>
        <div ref={containerRef} className="h-full" id="canvas" />
      </CanvasMenu>
    </EditorEngineContext.Provider>
  )
}
