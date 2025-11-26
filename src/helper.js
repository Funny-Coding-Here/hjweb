import { useState, useEffect } from 'react'

const hlp = {
  getWindowDimensions: () => {
    const { innerWidth: width, innerHeight: height } = window
    return {
      width,
      height,
    }
  },

  useWindowDimensions: () => {
    const [windowDimensions, setWindowDimensions] = useState(
      hlp.getWindowDimensions()
    )

    useEffect(() => {
      function handleResize() {
        setWindowDimensions(hlp.getWindowDimensions())
      }

      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }, [])

    return windowDimensions
  },

  post: function (url, param, token) {
    return fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      withCredentials: true,
      body: JSON.stringify(param),
    })
      .then(response => {
        let res = response.json()
        return res
      })
      .then(result => {
        return result
      })
  },
}

export default hlp
