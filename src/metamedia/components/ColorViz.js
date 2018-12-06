import React from 'react'

import Spinner from '@instructure/ui-elements/lib/components/Spinner'

import ColorSwatches from './ColorSwatch'

const ColorViz = ({ data, groupBy }) => {
  if (!data) return <Spinner title='Page loading' size='medium' />

  let swatches = []
  let prevGroup = 0
  for (let i = 0; i < data.length; i++) {
    const page = data[i]
    if (!page.palette) continue
    const start = page[groupBy] !== prevGroup
    const nextGroup = (i < data.length - 1) ? data[i + 1][groupBy] : 0
    const end = page[groupBy] !== nextGroup
    prevGroup = page[groupBy]
    swatches.push(<ColorSwatches key={Math.random()} page={page} start={start} end={end} />)
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'start',
      flexWrap: 'wrap'
    }}>
      {swatches}
    </div>
  )
}

export default ColorViz
