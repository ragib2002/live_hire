import { SignInButton } from '@clerk/clerk-react'
import './App.css'

function App() {

  return (
    <>
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Live Hire</h1>
        <SignInButton mode='modal'/>
      </header>
    </div>
    </>
  )
}

export default App
