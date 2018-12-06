import React from 'react'
import ReactDOM from 'react-dom'

import View from '@instructure/ui-layout/lib/components/View'
import Text from '@instructure/ui-elements/lib/components/Text'

const ColorRect = ({ color }) => (
  <div
    key={Math.random()}
    style={{
      // display: 'inline-block',
      width: 60,
      height: 10,
      backgroundColor: 'rgb(' + color.join(',') + ')'
    }}
  />
)

// function importAll(r) {
//   let images = {};
//   r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
//   return images;
// }

// const images = importAll(require.context('../../../data/res/screenshots/', false, /\.(png|jpe?g|svg)$/));

export default class PageInfo extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      data: props.data
    }
    this.updateScreenshot = this.updateScreenshot.bind(this)
  }

  async updateScreenshot () {
    const background = await browser.runtime.getBackgroundPage()
    const q = await background.getScreenshot(this.state.data.pageId)
    const screenshot = q && q.screenshot ? q.screenshot : undefined

    this.setState({
      screenshot
    })
  }

  async componentDidMount () {
    this.updateScreenshot()
  }

  async componentDidUpdate (prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.data !== prevProps.data) {
      this.setState({ data: this.props.data })
      this.updateScreenshot()
    }
  }

  render () {
    const { data, screenshot } = this.state
    const { width } = this.props
    const palette = data.palette
    if (!data) return null
    return (<div style={{ width: width }}>
      <Text>
        {data.logos && data.logos.icon && <span><img width={16} src={data.logos.icon} />&nbsp;</span>}
        <strong>{data.title}</strong><br />
        <strong>URL:</strong> {data.protocol}//{data.hostname}{data.path}<br />
        <strong>Topic:</strong> {data.inference}<br />
        {/* <strong>Last visit time:</strong> {Date(data.pageId)}<br /> */}
      </Text>
      <div
        style={{
          display: 'flex',
          justifyContent: 'start',
          width: 360,
          height: 10,
          marginTop: 10,
          marginBottom: 10
        }}
      >
        {palette.Vibrant && <ColorRect color={palette.Vibrant._rgb} />}
        {palette.LightVibrant && <ColorRect color={palette.LightVibrant._rgb} />}
        {palette.DarkVibrant && <ColorRect color={palette.DarkVibrant._rgb} />}
        {palette.Muted && <ColorRect color={palette.Muted._rgb} />}
        {palette.LightMuted && <ColorRect color={palette.LightMuted._rgb} />}
        {palette.DarkMuted && <ColorRect color={palette.DarkMuted._rgb} />}
      </div>
      <div>
        <img src={screenshot} width={width} />
      </div>
    </div>)
  }
}
