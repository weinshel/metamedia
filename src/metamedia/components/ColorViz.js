import React from 'react'

import ColorSwatches from './ColorSwatch'

export default class ColorViz extends React.Component {
  constructor (props) {
    super(props)
  }

  render () {
    const { data, tabSessionData } = this.props

    let swatches = []
    let prevTsId = 0
    for (let i = 0; i < data.length; i++) {
      const page = data[i]
      if (!page.palette) continue
      const start = page.tsId !== prevTsId
      const nextTsId = (i < data.length - 1) ? data[i + 1].tsId : 0
      const end = page.tsId !== nextTsId
      prevTsId = page.tsId
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
}
