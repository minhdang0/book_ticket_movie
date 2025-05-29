import React, { useEffect, useState } from 'react'
import { IMovie } from '../../utils/interfaces/movie'

type Props = {

}

const ShowTime: React.FC<Props> = () => {
  const [movies, setMovies] = useState<IMovie[]>();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:4000/api/v1/movies", {
          method: "GET"
        });
        const data = await res.json();
        console.log(data.data)
      } catch (error) {

      }
    })()
  }, [])
  return (
    <div>ShowTime</div>
  )
}

export default ShowTime