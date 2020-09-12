import React, { memo, useEffect } from 'react'
// import PropTypes from 'prop-types'

import epub from 'epubjs'
import './Main.sass'

const epubRef = 'https://s3.amazonaws.com/moby-dick/moby-dick.epub'
// const epubRef = require('../../assets/aliceDynamic.epub')
// const epubRef = require('../../assets/Dalton-Reimer_Peace.epub')
// const epubRef = require('../../assets/Osutaka_no_Natsu.epub')
// const epubRef = require('../../assets/Tanka_RyokufuSanka.epub')

const Main = () => {
  const renderEpub = async () => {
    const book = epub(epubRef)
    var rendition = book.renderTo('area', {
      method: 'continuous',
      flow: 'paginated',
      spread: 'always',
      width: '100%',
      height: '100%'
    })
    console.log('rendition', rendition)
    try {
      var displayed = await rendition.display()
      console.log('displayed', displayed)
    } catch (error) {
      console.warn('err', error)
    }
  }

  useEffect(() => {
    renderEpub()
  }, [])

  return (
    <main>
      <h3>epub</h3>
      <section>
        <article id="area">

        </article>
      </section>
    </main>
  )
}

export default memo(Main)

Main.propTypes = {}
