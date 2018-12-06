import React from 'react'

import ColorSwatches from './ColorSwatch'

export default class ColorViz extends React.Component {
  constructor (props) {
    super(props)
  }

  render () {
    const { data } = this.props

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'start'
      }}>
        {data.map(page => page.palette && <ColorSwatches page={page} />)}
      </div>
    )
  }
}
