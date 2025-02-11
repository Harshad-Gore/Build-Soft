import { useEffect, useState } from 'react'
import './App.css'
import axios from 'axios'
function App() {
  const [jokes, setJokes] = useState([])

  useEffect(() => {
    axios.get('/api/jokes').then((res) => {
      setJokes(res.data)
    })
    .catch((error) => {
      console.log(error)
    })
  })
  return (
    <div>
      <h1>Counter</h1>
    </div>
  )
}

export default App
