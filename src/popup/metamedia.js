import React from 'react'
import ReactDOM from 'react-dom'

import theme from '@instructure/ui-themes/lib/canvas'
import Text from '@instructure/ui-elements/lib/components/Text'
import Button from '@instructure/ui-buttons/lib/components/Button'
import TabList from '@instructure/ui-tabs/lib/components/TabList'
import TabPanel from '@instructure/ui-tabs/lib/components/TabList/TabPanel'
import View from '@instructure/ui-layout/lib/components/View'

import { themeOverrides } from '../colors'

theme.use({ overrides: themeOverrides })

class Popup extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedIndex: 0
    }
    this.openDashboard = this.openDashboard.bind(this)
  }

  async openDashboard () {
    // console.log('I am here 1');
    const tabs = await browser.tabs.query({active: true, currentWindow: true})
    let tabId = tabs[0].id
    const dashboardData = {
      active: true,
      url: '../dist/metamedia.html',
      openerTabId: parseInt(tabId)
    }

    await browser.tabs.create(dashboardData)

    let activityType = 'click dashboard button on popup'
    let clickedElem = 'dashboard button'
    await logging.logPopupActions(activityType, clickedElem)
  }

  async componentDidMount () {

  }

  render () {
    const { selectedIndex } = this.state
    return (<div style={{width: 450}}>

      <TabList
        variant='minimal'
        selectedIndex={selectedIndex}
        onChange={(e) => this.setState({ selectedIndex: e })}
      >
        <TabPanel title='Summary'>
          <View as='div' borderWidth='0 0 small 0'>
            <Text>
              hello hello
            </Text>
          </View>
        </TabPanel>
      </TabList>

      <View as='div' textAlign='center'>
        <Button onClick={this.openDashboard} variant='success' margin='small'>open {EXT.NAME} dashboard</Button>
      </View>
    </div>)
  }
}

ReactDOM.render(<Popup />, document.getElementById('root'))
