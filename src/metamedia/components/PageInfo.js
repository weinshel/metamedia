import React from 'react'
import ReactDOM from 'react-dom'

import View from '@instructure/ui-layout/lib/components/View'
import Text from '@instructure/ui-elements/lib/components/Text'
import TruncateText from '@instructure/ui-elements/lib/components/TruncateText'


import ColorSwatches from './ColorSwatch'

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
    if (!data) return null
    return (<div style={{ width: width }}>
      <View as={'div'} style={{ width: width, height: width, overflow: 'scroll' }}>
        <img src={screenshot} width={width} />
      </View>
      {data.palette && <ColorSwatches palette={data.palette} />}
      <Text>
        {data.logos && data.logos.icon && <span><img width={16} src={data.logos.icon} />&nbsp;</span>}
        <strong>{data.title}</strong><br />
        <strong>URL:</strong> {data.protocol}//{data.hostname}{data.path}<br />
        <strong>Topic:</strong> {data.inference}<br />
        {/* <strong>Last visit time:</strong> {Date(data.pageId)}<br /> */}
      </Text>
      {data.themeColor && <div style={{ width: 100, height: 100, backgroundColor: data.themeColor }} />}
    </div>)
  }
}
