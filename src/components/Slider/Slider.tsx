import React, { useEffect, useState } from 'react'
import styles from './Slider.module.scss';

import slide1 from '../../assets/images/slide_1.jpg';
import slide2 from '../../assets/images/slides_2.jpg';
import slide3 from '../../assets/images/slide_3.png';


const dataSlider = [
    {   
        name:"Slider1",
        path: slide1
    },
    {   
        name:"Slider2",
        path: slide2
    },
    {   
        name:"Slider1",
        path: slide3
    }
]
const Slider:React.FC= () => {
    const [index, setIndex ] = useState(0)

    useEffect(() => {
        const myInterval = setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % dataSlider.length);
        }, 4000);

        return () => clearInterval(myInterval)
    }, [])
  return (
    <>
        <div className="slider"> 
           <div className={styles.slider__item} >
                <img src={dataSlider[index].path} alt={dataSlider[index].name} />
            </div>
            <button 
                className={styles.btn__prev} 
                onClick={() => setIndex(index === 0 ? dataSlider.length -1 : index -1)}>
                    <i className="ri-arrow-left-s-fill"></i>
            </button>
            <button 
                className={styles.btn__next} 
                onClick={() => setIndex((index +1) % dataSlider.length)}>
                    <i className="ri-arrow-right-s-fill"></i>
            </button>
            <div className={styles.dots}>
                {dataSlider.map((_, dotIndex) => {
                    return <span
                        key={dotIndex}
                        className={`${styles.dot} ${index === dotIndex ? styles.activeDot :""}`}
                        onClick={() => setIndex(dotIndex)}
                    />   
                })}
            </div>
        </div>
    </>
  )
    
 
}

export default Slider