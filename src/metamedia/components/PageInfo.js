import React from 'react'
import ReactDOM from 'react-dom'

import View from '@instructure/ui-layout/lib/components/View'
import Text from '@instructure/ui-elements/lib/components/Text'


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

    // const image = <img src={screenshot} width={400} />

    this.setState({
      screenshot: screenshot
      // palette:pal,
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
    return (<div>
      <View as={'div'} width={400} height={400} style={{ width: 400, height: 400, overflow: 'scroll' }}>
        <img src={screenshot} width={400} />
      </View>
      {data.palette && <Text>{JSON.stringify(data.palette)}</Text>}
      {data.palette && data.palette.map(c => {
        const col = 'rgb(' + c.join(',') + ')'
        return (<div key={Math.random()} style={{width: 50, height: 50, backgroundColor: col}} />)
      })}
      <Text>
        <p>
          <strong>{data.title}</strong><br />
          <strong>Topic:</strong> {data.inference}<br />
          <strong>URL:</strong> {data.protocol}//{data.hostname}{data.path}<br />
          <strong>Visited</strong> {data.visitCount} times<br />
          <strong>Last visit time:</strong> {Date(data.lastVisitTime)}<br />
        </p>
      </Text>
      {data.themeColor && <div style={{ width: 100, height: 100, backgroundColor: data.themeColor }} />}
    </div>)
  }
}
