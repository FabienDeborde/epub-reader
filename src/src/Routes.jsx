import React, { memo, useState } from 'react'
import { Router } from '@reach/router'

import Main from './components/Main'
import Sidebar from './components/Sidebar'

import 'sanitize.css'
import './styles/styles.sass'

const Routes = () => {
  const [currentBook, setCurrentBook] = useState(null)
  return (
    <div className="wrapper">
      <Sidebar setCurrentBook={setCurrentBook}/>
      <Router className="router">
        <Main path="/" currentBook={currentBook}/>
      </Router>
    </div>
  )
}

export default memo(Routes)

Routes.propTypes = {}
