import { useMemo } from 'react'

import { Engine } from '@/core'
import DefaultLayout from '@/layouts/default'
import { Canvas } from '@/components/canvas'

export default function IndexPage() {
  const engine = useMemo(() => {
    return new Engine()
  }, [])

  return (
    <DefaultLayout>
      <Canvas engine={engine} />
    </DefaultLayout>
  )
}
