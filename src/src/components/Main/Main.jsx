import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import queryString from 'query-string'
import PropTypes from 'prop-types'

import epub from 'epubjs'
import './Main.sass'

const epubRef = 'https://s3.amazonaws.com/moby-dick/moby-dick.epub'
// const epubRef = require('../../assets/aliceDynamic.epub')
// const epubRef = require('../../assets/Dalton-Reimer_Peace.epub')
// const epubRef = require('../../assets/Osutaka_no_Natsu.epub')
// const epubRef = require('../../assets/Tanka_RyokufuSanka.epub')

const Main = ({ navigate, location }) => {
  const [chapters, setChapters] = useState(null)
  // const [currentChapter, setCurrentChapter] = useState(null)
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [book, setBook] = useState(null)
  const [rendition, setRendition] = useState(null)
  const prevRef = useRef(null)
  const nextRef = useRef(null)

  const createBook = () => {
    const book = epub(epubRef)
    const rendition = book.renderTo('viewer', {
      method: 'continuous',
      flow: 'paginated',
      width: '100%',
      height: 600,
      spread: 'always'
    })
    setBook(book)
    setRendition(rendition)
  }

  const _handleKeyboard = useCallback(
    (e) => {
      if (book) {
        // Left Key
        if ((e.keyCode || e.which) === 37) {
          book.package.metadata.direction === 'rtl' ? rendition.next() : rendition.prev()
        }

        // Right Key
        if ((e.keyCode || e.which) === 39) {
          book.package.metadata.direction === 'rtl' ? rendition.prev() : rendition.next()
        }
      }
    },
    [book, rendition]
  )

  const renderBook = useCallback(
    async () => {
      if (book && rendition) {
        const params = queryString.parse(location.search)
        const currentSectionIndex = (params && params.loc) ? params.loc : undefined
        rendition.on('keyup', _handleKeyboard)
        // rendition.on('rendered', function (section) {
        //   const current = book.navigation && book.navigation.get(section.href)
        //   if (current) {
        //     // setCurrentChapter(current)
        //   }
        // })

        rendition.on('relocated', function (bookLocation) {
          console.log(bookLocation)
          if (chapters && bookLocation) {
            const index = chapters.findIndex(chapter => chapter.href === bookLocation.start.href)
            setCurrentChapterIndex(index)
            window.history.pushState(null, '', `${location.pathname}?loc=${bookLocation.start.href}`)
          }
        })

        try {
          const displayed = await rendition.display(currentSectionIndex)
          const navigation = await book.loaded.navigation
          console.log('displayed', displayed)
          setChapters(navigation.toc)
        } catch (error) {
          console.warn('err', error)
        }
      }
    },
    [book, rendition, location, _handleKeyboard, chapters]
  )

  useEffect(() => {
    createBook()
    // window.addEventListener('resize', renderEpub, false)
    // return () => {
    //   window.removeEventListener('resize', renderEpub, false)
    // }
    return () => {
      console.log('unloading')
      // book.destroy()
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keyup', _handleKeyboard, false)
    return () => {
      document.removeEventListener('keyup', _handleKeyboard, false)
    }
  }, [_handleKeyboard])

  useEffect(() => {
    renderBook()
  }, [renderBook])

  useEffect(() => {
    const params = queryString.parse(location.search)
    if (params && params.loc && chapters) {
      const index = chapters.findIndex(chapter => chapter.href === params.loc)
      setCurrentChapterIndex(index)
    }
  }, [location, chapters])

  const _handlePrevClick = (e) => {
    book.package.metadata.direction === 'rtl' ? rendition.next() : rendition.prev()
  }
  const _handleNextClick = (e) => {
    book.package.metadata.direction === 'rtl' ? rendition.prev() : rendition.next()
  }

  const _handleSelectChapter = (e) => {
    const index = e.target.value
    if (rendition) {
      const chap = chapters[index]
      if (chap) {
        rendition.display(chap.href)
        setCurrentChapterIndex(index)
        navigate(`./?loc=${chap.href}`)
      }
    }
  }

  const _renderChapters = () => {
    if (!chapters) return null
    return chapters.map((chapter, index) => {
      const { id, label } = chapter
      return (
        <option
          key={id}
          value={index}
        >{label}</option>
      )
    })
  }

  return (
    <main>
      <h3>epub</h3>
      <select onChange={_handleSelectChapter} value={currentChapterIndex}>
        { _renderChapters() }
      </select>
      <section>
        <article id="viewer">

        </article>
        {
          book ? (
            <div className="controls">
              <button
                ref={prevRef}
                onClick={_handlePrevClick}
              >‹</button>
              <button
                ref={nextRef}
                onClick={_handleNextClick}
              >›</button>
            </div>
          )
            : null
        }
      </section>
    </main>
  )
}

export default memo(Main)

Main.propTypes = {
  navigate: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired
}
