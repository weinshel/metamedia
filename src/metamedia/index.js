import React from 'react'
import ReactDOM from 'react-dom'

import theme from '@instructure/ui-themes/lib/canvas'
import Text from '@instructure/ui-elements/lib/components/Text'
import TabList from '@instructure/ui-tabs/lib/components/TabList'
import TabPanel from '@instructure/ui-tabs/lib/components/TabList/TabPanel'
import Button from '@instructure/ui-buttons/lib/components/Button'

import { themeOverrides } from '../colors'
import RawData from './components/RawData'
import PageShots from './components/PageShots'
import ColorViz from './components/ColorViz'

theme.use({ overrides: themeOverrides })

class Popup extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedIndex: 0
    }
  }

  async componentDidMount () {
    // stub
    const background = await browser.runtime.getBackgroundPage()
    const tabSessionData = await background.queryDexie('getAllTabSessions', {})
    const pageData = await background.queryDexie('getAllPages', {})
    this.setState({ pageData, tabSessionData })
  }

  render () {
    const { selectedIndex, pageData, tabSessionData } = this.state

    return (<div>
      <TabList
        variant='minimal'
        selectedIndex={selectedIndex}
        onChange={(e) => this.setState({ selectedIndex: e })}
      >
        <TabPanel title='Color'>
          {pageData && <ColorViz data={pageData} tabSessionData={tabSessionData} />}
        </TabPanel>
        <TabPanel title='Screenshots'>
          {pageData && <PageShots data={pageData} />}
        </TabPanel>
        <TabPanel title='Raw Page Data'>
          {pageData && <RawData data={pageData} />}
        </TabPanel>
        <TabPanel title='Raw Tab Data'>
          {tabSessionData && <RawData data={tabSessionData} />}
        </TabPanel>
      </TabList>
    </div>)
  }
}

ReactDOM.render(<Popup />, document.getElementById('root'))
