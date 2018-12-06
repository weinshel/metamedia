import React from 'react'

import Popover, { PopoverTrigger, PopoverContent } from '@instructure/ui-overlays/lib/components/Popover'
import CloseButton from '@instructure/ui-buttons/lib/components/CloseButton'
import View from '@instructure/ui-layout/lib/components/View'

import PageInfo from './PageInfo'

const ColorSquare = ({ color }) => (
  <div
    key={Math.random()}
    style={{
      // display: 'inline-block',
      width: 10,
      height: 60,
      backgroundColor: 'rgb(' + color.join(',') + ')'
    }}
  />
)

class ColorSwatches extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      showPopover: false
    }
    this.showPopover = this.showPopover.bind(this)
    this.hidePopover = this.hidePopover.bind(this)
  }

  showPopover () {
    this.setState({
      showPopover: true
    })
  }

  hidePopover () {
    this.setState({
      showPopover: false
    })
  }

  renderCloseButton () {
    return (
      <CloseButton
        placement='end'
        offset='x-small'
        variant='icon'
        onClick={this.hidePopover}
      >
        Close
      </CloseButton>
    )
  }

  render () {
    const { page, margin, start, end } = this.props
    if (!page) return null
    const palette = page.palette
    return (
      <View>
        <Popover
          on='click'
          show={this.state.showPopover}
          onDismiss={this.hidePopover}
          shouldContainFocus
          shouldReturnFocus
          shouldCloseOnDocumentClick
          label='popover for page'
          offsetY='16px'
          mountNode={() => document.getElementById('root')}
          // variant='inverse'
        >
          <PopoverTrigger>
            <div
              onClick={this.showPopover}
              style={{
                display: 'flex',
                justifyContent: 'start',
                width: 60,
                height: 60,
                borderWidth: 3,
                borderColor: 'black',//stringToColor(page.tsId),
                borderStyle: 'solid',
                marginTop: 5,
                marginBottom: 5,
                marginLeft: start ? 25 : 0,
                borderTopLeftRadius: start ? 35 : 0,
                borderBottomLeftRadius: start ? 35: 0,
                borderTopRightRadius: end ? 35 : 0,
                borderBottomRightRadius: end ? 35 : 0,
                overflow: 'hidden'
              }}
            >
              {palette.Vibrant && <ColorSquare color={palette.Vibrant._rgb} />}
              {palette.LightVibrant && <ColorSquare color={palette.LightVibrant._rgb} />}
              {palette.DarkVibrant && <ColorSquare color={palette.DarkVibrant._rgb} />}
              {palette.Muted && <ColorSquare color={palette.Muted._rgb} />}
              {palette.LightMuted && <ColorSquare color={palette.LightMuted._rgb} />}
              {palette.DarkMuted && <ColorSquare color={palette.DarkMuted._rgb} />}
            </div>
          </PopoverTrigger>
          <PopoverContent>
            <View as='div' padding='small'>
              {this.renderCloseButton()}
              <PageInfo data={this.props.page} width={400} />
            </View>
          </PopoverContent>
        </Popover>
      </View>
    )
  }
}

export default ColorSwatches
