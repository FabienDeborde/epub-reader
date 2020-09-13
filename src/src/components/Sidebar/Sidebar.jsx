import React, { memo } from 'react'
import PropTypes from 'prop-types'

const books = [
  {
    title: '見本1',
    ref: 'https://s3.amazonaws.com/moby-dick/moby-dick.epub'
  },
  {
    title: '見本2',
    ref: require('../../assets/aliceDynamic.epub')
  },
  {
    title: '見本3',
    ref: require('../../assets/progit-ja.1016.epub')
  }
]

const Sidebar = ({ setCurrentBook }) => {
  const _handleClick = (ref) => {
    window.history.pushState(null, '', `${window.location.pathname}`)
    setCurrentBook(ref)
  }
  const _renderList = () => {
    return books.map((book, i) => {
      const { title, ref } = book
      return <li key={i} onClick={ () => { _handleClick(ref) } }>{title}</li>
    })
  }

  return (
    <nav className="sidebar">
      <ul>
        {_renderList()}
      </ul>
    </nav>
  )
}

export default memo(Sidebar)

Sidebar.propTypes = {
  setCurrentBook: PropTypes.func.isRequired
}
