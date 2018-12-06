import React from 'react'
import ReactDOM from 'react-dom'

import Pagination from '@instructure/ui-pagination/lib/components/Pagination'
import PaginationButton from '@instructure/ui-pagination/lib/components/Pagination/PaginationButton'

import PageInfo from './PageInfo'

export default class PageShots extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      currentPage: 0,
      currentPageData: props.data[0]
    }

    this.setPage = this.setPage.bind(this)
  }

  setPage (page) {
    // const { currentPageData } = this.state
    const { data } = this.props
    this.setState({
      currentPage: page,
      currentPageData: data[page]
    })
  }

  render () {
    const { data } = this.props
    const { currentPage, currentPageData } = this.state

    const pages = Array.from(Array(data.length)).map((v, i) => (
      <PaginationButton
        key={i}
        onClick={() => this.setPage(i)}
        current={i === currentPage}>
        {i + 1}
      </PaginationButton>
    ))

    return (<div>
      <PageInfo data={currentPageData} width={600}/>
      <Pagination
        as='nav'
        margin='small'
        variant='compact'
        labelNext='Next Page'
        labelPrev='Previous Page'
      >
        {pages}
      </Pagination>
    </div>)
  }
}
