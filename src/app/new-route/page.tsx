'use client'

import type {
  DirectionsResponseData,
  FindPlaceFromTextResponseData,
} from '@googlemaps/google-maps-services-js'

import { FormEvent, useRef, useState } from 'react'
import { useMap } from '../hooks/useMap'

export default function NewRoutePage() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const map = useMap(mapContainerRef)

  const [directionsData, setDirectionsData] = useState<
    DirectionsResponseData & { request: any }
  >()

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

    const directionsData: DirectionsResponseData & { request: any } =
      await directionsResponse.json()
    setDirectionsData(directionsData)

    map?.removeAllRoutes()

    await map?.addRouteWithIcons({
      routeId: '1',
      startMarkerOptions: {
        position: directionsData.routes[0].legs[0].start_location,
      },
      endMarkerOptions: {
        position: directionsData.routes[0].legs[0].end_location,
      },
      carMarkerOptions: {
        position: directionsData.routes[0].legs[0].start_location,
      },
    })
  }

  async function createRoute() {
    const startAddress = directionsData!.routes[0].legs[0].start_address
    const endAddress = directionsData!.routes[0].legs[0].end_address

    const response = await fetch('http://localhost:3000/routes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${startAddress} - ${endAddress}`,
        source_id: directionsData!.request.origin.place_id,
        destination_id: directionsData!.request.destination.place_id,
      }),
    })

    const route = await response.json()
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

        {directionsData && (
          <ul
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              marginTop: 32,
            }}
          >
            <li>Origem {directionsData.routes[0].legs[0].start_address}</li>
            <li>Destino {directionsData.routes[0].legs[0].end_address}</li>
            <button onClick={createRoute}>Criar Rota</button>
          </ul>
        )}
      </aside>

      <div
        id="map"
        style={{ width: '100%', height: '100%' }}
        ref={mapContainerRef}
      ></div>
    </div>
  )
}
