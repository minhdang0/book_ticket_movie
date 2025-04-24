import React, { useEffect } from 'react'

const ScrollTop:React.FC = () => {
    useEffect(() => {
         window.scrollTo(0,0);
    })
  return null
}

export default ScrollTop