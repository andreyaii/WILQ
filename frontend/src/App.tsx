
import Landing from './pages/Landing'

function App() {
    const handleLogin = () => {
        console.log('Login form submitted')
    }

    return (
        <Landing onLogin={handleLogin} />
    )
}

export default App
