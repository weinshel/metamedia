import React from 'react'
import ReactDOM from 'react-dom'

import theme from '@instructure/ui-themes/lib/canvas'
import TabList from '@instructure/ui-tabs/lib/components/TabList'
import TabPanel from '@instructure/ui-tabs/lib/components/TabList/TabPanel'
import RadioInputGroup from '@instructure/ui-forms/lib/components/RadioInputGroup'
import RadioInput from '@instructure/ui-forms/lib/components/RadioInput'

import ColorViz from './components/ColorViz'
import PageShots from './components/PageShots'
import RawData from './components/RawData'
import { themeOverrides } from '../colors'

theme.use({ overrides: themeOverrides })

class Popup extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedIndex: 0,
      groupBy: 'tsId'
    }
    this.updateGroup = this.updateGroup.bind(this)
  }

  async componentDidMount () {
    // stub
    const background = await browser.runtime.getBackgroundPage()
    const tabSessionData = await background.queryDexie('getAllTabSessions', {})
    const pageData = await background.queryDexie('getAllPages', { groupBy: 'tsId' })
    this.setState({ pageData, tabSessionData })
  }

  async updateGroup (event) {
    const groupBy = event.target.value
    console.log('groupBy', groupBy)
    this.setState({ pageData: null, groupBy: groupBy })
    const background = await browser.runtime.getBackgroundPage()
    const pageData = await background.queryDexie('getAllPages', { groupBy: groupBy })
    this.setState({ pageData: pageData, groupBy: groupBy })
  }

  render () {
    const { selectedIndex, pageData, tabSessionData, groupBy } = this.state

    return (<div>
      <TabList
        variant='minimal'
        selectedIndex={selectedIndex}
        onChange={(e) => this.setState({ selectedIndex: e })}
      >
        <TabPanel title='Color'>
          <RadioInputGroup
            name='group'
            variant='toggle'
            description='Group by'
            value={this.state.groupBy}
            onChange={this.updateGroup}
          >
            <RadioInput label='Tab' value='tsId' context='off' />
            <RadioInput label='Domain' value='domain' context='off' />
            <RadioInput label='Topic' value='inference' context='off' />
          </RadioInputGroup>
          <ColorViz data={pageData} tabSessionData={tabSessionData} groupBy={groupBy} />
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
