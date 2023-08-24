'use client'

import type { FindPlaceFromTextResponseData } from '@googlemaps/google-maps-services-js'
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

    const [sourcePlace, destinationPlace]: FindPlaceFromTextResponseData[] =
      await Promise.all([sourceResponse.json(), destinationResponse.json()])

    if (sourcePlace.status !== 'OK') {
      console.error(sourcePlace.error_message)
      alert('Não foi possível carregar a origem')
      return
    }

    if (destinationPlace.status !== 'OK') {
      console.error(sourcePlace.error_message)
      alert('Não foi possível carregar o destino')
      return
    }
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
