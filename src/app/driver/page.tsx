'use client'

import { useEffect, useRef } from 'react'
import useSWR from 'swr'

import { useMap } from '../hooks/useMap'
import { fetcher } from '../utils/http'
import { Route } from '../utils/models'
import { socket } from '../utils/socket-io'
import { Button, NativeSelect, Typography } from '@mui/material'
import Grid2 from '@mui/material/Unstable_Grid2/Grid2'
import { RouteSelect } from '../components/RouteSelect'

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
    const route: Route = await response.json()

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

    const { steps } = route.directions.routes[0].legs[0]

    for (const step of steps) {
      await sleep(2000)
      map?.moveCar(routeId, step.start_location)
      socket.emit('new-points', {
        route_id: routeId,
        lat: step.start_location.lat,
        lng: step.start_location.lng,
      })

      await sleep(2000)
      map?.moveCar(routeId, step.end_location)
      socket.emit('new-points', {
        route_id: routeId,
        lat: step.end_location.lat,
        lng: step.end_location.lng,
      })
    }
  }

  useEffect(() => {
    socket.connect()
    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <Grid2 container sx={{ display: 'flex', flex: 1 }}>
      <Grid2 xs={4} p={3}>
        <Typography variant="h4">Minha viagem</Typography>

        <div>
          <RouteSelect id="route" />

          <Button
            variant="contained"
            fullWidth
            onClick={startRoute}
            sx={{ mt: 1, py: 2 }}
          >
            Iniciar Viagem
          </Button>
        </div>
      </Grid2>

      <Grid2 id="map" ref={mapContainerRef} xs={8}></Grid2>
    </Grid2>
  )
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
