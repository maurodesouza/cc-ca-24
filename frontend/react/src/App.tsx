import { useState } from 'react'
import './App.css'

function App() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [document, setDocument] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('http://localhost:4156/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          document,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`Success! AccountId: ${data.accountId}`)
      } else {
        setMessage(data.message)
      }
    } catch (err) {
      console.error(err)
      setMessage('Erro ao conectar com o servidor')
    }
  }

  return (
    <>
      <section id="center">
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Name"
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email"
            />
          </div>
          <div>
            <label>Document (CPF):</label>
            <input
              type="text"
              value={document}
              onChange={(e) => setDocument(e.target.value)}
              aria-label="Document"
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Password"
            />
          </div>
          <button type="submit">Create account</button>
        </form>
        {message && <p>{message}</p>}
      </section>
    </>
  )
}

export default App
