import { useEffect, useRef } from 'react'
import { Assets, Sprite, Texture } from 'pixi.js'

import { Engine } from '../core/Engine'
import { ColorUtils } from '../core/utils/styles'

import DefaultLayout from '@/layouts/default'
import { IDRectangleBase, IDTextBase, IDGroupBase } from '@/core/elements'

export default function IndexPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initApp = async () => {
      const engine = new Engine()

      if (containerRef.current) {
        await engine.init({
          background: 0xdfdfdf,
          resizeTo: containerRef.current,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
          enableZoom: true,
          data: {
            id: 'app-1',
            name: 'app-1',
            frame: {
              id: 'frame-1',
              name: 'Frame 1',
              backgroundColor: {
                r: 1,
                g: 1,
                b: 1,
                a: 1,
              },
              position: {
                x: 50,
                y: 50,
              },
              size: {
                width: 1024,
                height: 1024,
              },
              type: 'FRAME',
              children: [
                {
                  id: 'rectangle-1',
                  name: 'Rectangle 1',
                  type: 'RECTANGLE',
                  position: {
                    x: 500,
                    y: 500,
                  },
                  size: {
                    width: 100,
                    height: 100,
                  },
                  cornerRadius: 20,
                  rotation: Math.PI / 4,
                  fills: [{ type: 'SOLID', color: ColorUtils.hexToRGBA('#EB2424') }],
                } as IDRectangleBase,
                {
                  id: 'text-1',
                  name: 'Text 1',
                  type: 'TEXT',
                  position: {
                    x: 0,
                    y: 0,
                  },
                  size: {
                    width: 100,
                    height: 50,
                  },
                  locked: false,
                  characters: 'This is text of example 1',
                  style: {
                    fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
                    fontSize: 24,
                    fontWeight: 400,
                  },
                } as IDTextBase,
                {
                  id: 'text-2',
                  name: 'Text 2',
                  type: 'TEXT',
                  position: {
                    x: 0,
                    y: 300,
                  },
                  locked: false,
                  rotation: Math.PI / 4,
                  characters: 'This is text of example 2',
                  style: {
                    fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
                    fontSize: 24,
                    fontWeight: 400,
                  },
                } as IDTextBase,
                {
                  id: 'text-3',
                  name: 'Text 3',
                  type: 'TEXT',
                  position: {
                    x: 0,
                    y: 300,
                  },
                  locked: false,
                  characters: 'This is text of example 3',
                  style: {
                    fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
                    fontSize: 24,
                    fontWeight: 400,
                  },
                } as IDTextBase,
                {
                  id: 'group-1',
                  name: 'Group 1',
                  type: 'GROUP',
                  position: {
                    x: 600,
                    y: 600,
                  },
                  children: [
                    {
                      id: 'rectangle-2',
                      name: 'Rectangle 2',
                      type: 'RECTANGLE',
                      position: {
                        x: 20,
                        y: 20,
                      },
                      size: {
                        width: 20,
                        height: 20,
                      },
                      fills: [{ type: 'SOLID', color: ColorUtils.hexToRGBA('#d9d9d9') }],
                    },
                    {
                      id: 'rectangle-3',
                      name: 'Rectangle 3',
                      type: 'RECTANGLE',
                      position: {
                        x: 70,
                        y: 70,
                      },
                      size: {
                        width: 20,
                        height: 20,
                      },
                      fills: [{ type: 'SOLID', color: ColorUtils.hexToRGBA('#d9d9d9') }],
                    },
                  ],
                } as IDGroupBase,
              ],
            },
          },
        })
      }

      if (containerRef.current) {
        containerRef.current.appendChild(engine.app.canvas)
      }

      // 加载资源
      const original = await Assets.load<Texture>('/original.png')
      // const initMaskTexture = await Assets.load<Texture>('/assets/mask.png')

      const originalPreview = new Sprite(original)
      // const maskGraphics = drawMask(initMaskTexture)

      originalPreview.scale.set(0.5)
      originalPreview.anchor.set(0.5)
    }

    initApp()
  }, [])

  return (
    <DefaultLayout>
      <div ref={containerRef} className="h-full" id="canvas" />
    </DefaultLayout>
  )
}
