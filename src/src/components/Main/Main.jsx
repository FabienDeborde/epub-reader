import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import queryString from 'query-string'
import PropTypes from 'prop-types'

import epub from 'epubjs'

const Main = ({ navigate, location, currentBook }) => {
  const bookRef = useRef(null)
  const [chapters, setChapters] = useState(null)
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [book, setBook] = useState(null)
  const [rendition, setRendition] = useState(null)
  const prevRef = useRef(null)
  const nextRef = useRef(null)

  const createBook = useCallback(
    () => {
      if (bookRef && bookRef.current) bookRef.current.destroy()
      const newBook = epub(currentBook)
      const rendition = newBook.renderTo('viewer', {
        method: 'continuous',
        flow: 'paginated',
        width: '100%',
        height: 600,
        spread: 'always'
      })
      setBook(newBook)
      setRendition(rendition)

      bookRef.current = newBook

      // console.log('book', book)
      // console.log('rendition', rendition)
    },
    [currentBook]
  )

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
          // console.log(bookLocation)
          if (chapters && bookLocation) {
            const index = chapters.findIndex(chapter => chapter.href === bookLocation.start.href)
            setCurrentChapterIndex(index)
            window.history.pushState(null, '', `${location.pathname}?loc=${bookLocation.start.href}`)
          }
        })

        try {
          // eslint-disable-next-line no-unused-vars
          const displayed = await rendition.display(currentSectionIndex)
          const navigation = await book.loaded.navigation
          // console.log('displayed', displayed)
          setChapters(navigation.toc)
        } catch (error) {
          console.warn('err', error)
        }
      }
    },
    [book, rendition, location, _handleKeyboard, chapters]
  )

  useEffect(() => {
    if (currentBook) {
      createBook()
    }
    // window.addEventListener('resize', renderEpub, false)
    // return () => {
    //   window.removeEventListener('resize', renderEpub, false)
    // }
    return () => {
      // console.log('unloading')
      // if (book) book.destroy()
    }
  }, [currentBook, createBook])

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
    if (params && params.loc && !book) {

    }

    if (params && params.loc && chapters) {
      const index = chapters.findIndex(chapter => chapter.href === params.loc)
      setCurrentChapterIndex(index)
    }
  }, [location, chapters, book])

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
  if (!currentBook) return null

  return (
    <main>
      <h3>チャプター一覧</h3>
      <select onChange={_handleSelectChapter} value={currentChapterIndex}>
        { _renderChapters() }
      </select>
      <section>
        <article id="viewer"></article>
        {
          book
            ? (
              <div className="controls">
                <button
                  ref={prevRef}
                  onClick={_handlePrevClick}
                  className="control_btn prev"
                  type="button"
                  role="navigation"
                  title="前のページへ"
                >‹</button>
                <button
                  ref={nextRef}
                  onClick={_handleNextClick}
                  className="control_btn next"
                  type="button"
                  role="navigation"
                  title="次のページへ"
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
  location: PropTypes.object.isRequired,
  currentBook: PropTypes.string
}
