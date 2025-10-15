import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { Routes, Route } from 'react-router-dom'

import Home from './pages/Home/Home'

function App() {


  return (
    <>
        <Routes>
          <Route path="/" element={<Home/>}></Route>
        </Routes>
    </>
  )
}

export default App
