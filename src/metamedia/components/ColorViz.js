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
    data.forEach(page => {
      if (!page.palette) return
      const margin = page.tsId === prevTsId ? 0 : 16
      prevTsId = page.tsId
      swatches.push(<ColorSwatches key={Math.random()} page={page} margin={margin} />)
    })

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'start',
        flexWrap: 'wrap'
      }}>
        {/* {tabSessionData.map(tabSession => (
          <div key={Math.random()}>
            {tabSession.pages.map(page => (
              page.pageId && <ColorSwatches key={Math.random()} page={data[0]} />
            ))}
          </div>
        ))} */}
        {swatches}
      </div>
    )
  }
}
