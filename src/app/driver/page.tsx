'use client'

import { useRef } from 'react'
import useSWR from 'swr'

import { useMap } from '../hooks/useMap'
import { fetcher } from '../utils/http'
import { Route } from '../utils/models'

export default function DriverPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const map = useMap(mapContainerRef)

  const {
    data: routes,
    error,
    isLoading,
  } = useSWR<Route[]>('http://localhost:3000/routes', fetcher, {
    fallback: [],
  })

  async function startRoute() {
    const routeId = (document.getElementById('route') as HTMLSelectElement)
      .value

    const response = await fetch(`http://localhost:3000/routes/${routeId}`)
    const route = await response.json()

    map?.removeAllRoutes()

    await map?.addRouteWithIcons({
      routeId: routeId,
      startMarkerOptions: {
        position: route.directions.routes[0].legs[0].start_location,
      },
      endMarkerOptions: {
        position: route.directions.routes[0].legs[0].end_location,
      },
      carMarkerOptions: {
        position: route.directions.routes[0].legs[0].start_location,
      },
    })
  }

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      <aside style={{ width: '30%', height: '100%', padding: 16 }}>
        <h1>Minha viagem</h1>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <select id="route">
            {isLoading && <option>carregando rotas...</option>}
            {routes?.map((route) => (
              <option value={route.id} key={route.id}>
                {route.name}
              </option>
            ))}
          </select>
          <button type="submit" onClick={startRoute}>
            Iniciar Viagem
          </button>
        </div>
      </aside>

      <div
        id="map"
        style={{ width: '100%', height: '100%' }}
        ref={mapContainerRef}
      ></div>
    </div>
  )
}
