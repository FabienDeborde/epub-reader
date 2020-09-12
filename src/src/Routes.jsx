import React, { memo } from 'react'
import { Router } from '@reach/router'

import Main from './components/Main'
import Sidebar from './components/Sidebar'

import 'sanitize.css'
import './style.sass'

const Routes = () => {
  return (
    <div className="wrapper">
      <Sidebar />
      <Router className="router">
        <Main path="/" />
      </Router>
    </div>
  )
}

export default memo(Routes)

Routes.propTypes = {}
