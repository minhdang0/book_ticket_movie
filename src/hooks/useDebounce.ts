import { useEffect, useState } from "react"

const useDebounce = (value : any, delay:number) => {
    const [input, setInput] = useState(value)

    useEffect(() => {
        const myTime = setTimeout(() =>{
            setInput(value);
        },  delay);
        return () => {
            clearTimeout(myTime)
        }
    },[value, delay])

    return input;
}

export default useDebounce;