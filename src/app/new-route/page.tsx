'use client'

import type { FindPlaceFromTextResponseData } from '@googlemaps/google-maps-services-js'

import { FormEvent, useRef } from 'react'
import { useMap } from '../hooks/useMap'

export default function NewRoutePage() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const map = useMap(mapContainerRef)

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

    const placeSourceId = sourcePlace.candidates[0].place_id
    const placeDestinationId = destinationPlace.candidates[0].place_id

    const directionsResponse = await fetch(
      `http://localhost:3000/directions?originId=${placeSourceId}&destinationId=${placeDestinationId}`
    )

    const directionsData = await directionsResponse.json()
    console.log(directionsData)
  }

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      <aside style={{ width: '30%', height: '100%', padding: 16 }}>
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
      </aside>

      <div
        id="map"
        style={{ width: '100%', height: '100%' }}
        ref={mapContainerRef}
      ></div>
    </div>
  )
}
