import './App.css'
import Login from './Login'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <Login />
    </ThemeProvider>
  )
}

export default App
