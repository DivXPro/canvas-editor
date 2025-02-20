import { ColorUtils } from '../core/utils/styles'

export const demoData: any = {
  id: 'app-1',
  name: 'app-1',
  description: 'app-1',
  nodes: [
    {
      id: 'frame-1',
      name: 'Frame 1',
      backgroundColor: {
        r: 1,
        g: 1,
        b: 1,
        a: 1,
      },
      position: {
        x: 0,
        y: 0,
      },
      size: {
        width: 1024,
        height: 512,
      },
      type: 'FRAME',
      children: [
        {
          id: 'rectangle-1',
          name: 'Rectangle 1',
          type: 'RECTANGLE',
          position: {
            x: 200,
            y: 100,
          },
          size: {
            width: 100,
            height: 100,
          },
          // cornerRadius: 20,
          // rotation: -Math.PI / 4,
          fills: [{ type: 'SOLID', color: ColorUtils.hexToRGBA('#EB2424') }],
        },
        {
          id: 'group-1',
          name: 'Group 1',
          type: 'GROUP',
          position: {
            x: 300,
            y: 300,
          },
          size: {
            width: 100,
            height: 100,
          },
          rotation: Math.PI / 6,
          children: [
            {
              id: 'rectangle-2',
              name: 'Rectangle 2',
              type: 'RECTANGLE',
              position: {
                x: -25,
                y: -25,
              },
              size: {
                width: 50,
                height: 50,
              },
              fills: [{ type: 'SOLID', color: ColorUtils.hexToRGBA('#c1d6d9') }],
            },
            {
              id: 'rectangle-3',
              name: 'Rectangle 3',
              type: 'RECTANGLE',
              position: {
                x: 25,
                y: 25,
              },
              size: {
                width: 50,
                height: 50,
              },
              fills: [{ type: 'SOLID', color: ColorUtils.hexToRGBA('#d9d9d9') }],
            },
          ],
        },
        // {
        //   id: 'text-1',
        //   name: 'Text 1',
        //   type: 'TEXT',
        //   position: {
        //     x: 0,
        //     y: 250,
        //   },
        //   size: {
        //     width: 100,
        //     height: 50,
        //   },
        //   locked: false,
        //   characters: 'This is text of example 1',
        //   style: {
        //     fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
        //     fontSize: 24,
        //     fontWeight: 400,
        //   },
        // },
        // {
        //   id: 'text-2',
        //   name: 'Text 2',
        //   type: 'TEXT',
        //   position: {
        //     x: 0,
        //     y: 400,
        //   },
        //   locked: false,
        //   rotation: Math.PI / 4,
        //   characters: 'This is text of example 2',
        //   style: {
        //     fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
        //     fontSize: 24,
        //     fontWeight: 400,
        //   },
        // },
        // {
        //   id: 'text-3',
        //   name: 'Text 3',
        //   type: 'TEXT',
        //   position: {
        //     x: 0,
        //     y: 300,
        //   },
        //   locked: false,
        //   characters: 'This is text of example 3',
        //   style: {
        //     fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
        //     fontSize: 24,
        //     fontWeight: 400,
        //   },
        // },
      ],
    },
  ]
}
