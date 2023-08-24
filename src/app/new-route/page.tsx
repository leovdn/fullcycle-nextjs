'use client'
import { FormEvent } from 'react'

export default function NewRoutePage() {
  async function searchPlaces(event: FormEvent) {
    event.preventDefault()
    const source = (document.getElementById('source') as HTMLInputElement).value
    const destination = (
      document.getElementById('destination') as HTMLInputElement
    ).value

    const [sourceResponse, destinationResponse] = await Promise.all([
      fetch(`http://localhost:3000/places?text=${source}`),
      fetch(`http://localhost:3000/places?text=${destination}`),
    ])

    const [sourcePlace, destinationPlace] = await Promise.all([
      sourceResponse.json(),
      destinationResponse.json(),
    ])

    console.log(sourcePlace, destinationPlace)
  }

  return (
    <div>
      <h1>Nova rota</h1>
      <form
        style={{ display: 'flex', flexDirection: 'column' }}
        onSubmit={searchPlaces}
      >
        <input type="text" name="origem" id="source" placeholder="Origem" />
        <input
          type="text"
          name="destino"
          id="destination"
          placeholder="Destino"
        />
        <button type="submit">Pesquisar</button>
      </form>
    </div>
  )
}
