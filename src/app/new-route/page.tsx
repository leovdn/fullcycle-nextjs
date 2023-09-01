'use client'

import type {
  DirectionsResponseData,
  FindPlaceFromTextResponseData,
} from '@googlemaps/google-maps-services-js'

import { FormEvent, useRef, useState } from 'react'
import { useMap } from '../hooks/useMap'
import Grid2 from '@mui/material/Unstable_Grid2/Grid2'
import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material'

export default function NewRoutePage() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const map = useMap(mapContainerRef)

  const [directionsData, setDirectionsData] = useState<
    DirectionsResponseData & { request: any }
  >()

  const [openMessage, setOpenMessage] = useState(false)

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
    setOpenMessage(true)
  }

  return (
    <Grid2 container sx={{ display: 'flex', flex: 1 }}>
      <Grid2 xs={4} p={3}>
        <Typography variant="h4">Nova rota</Typography>

        <form onSubmit={searchPlaces}>
          <TextField id="source" label="Origem" fullWidth sx={{ mt: 2 }} />
          <TextField
            id="destination"
            label="Destino"
            fullWidth
            sx={{ mt: 1 }}
          />
          <Button
            variant="contained"
            type="submit"
            fullWidth
            sx={{ mt: 1, py: 2 }}
          >
            Pesquisar
          </Button>
        </form>

        {directionsData && (
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <List>
                <ListItem>
                  <ListItemText
                    primary={'Origem'}
                    secondary={directionsData.routes[0].legs[0].start_address}
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary={'Destino'}
                    secondary={directionsData.routes[0].legs[0].end_address}
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary={'Distância'}
                    secondary={directionsData.routes[0].legs[0].distance.text}
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary={'Duração'}
                    secondary={directionsData.routes[0].legs[0].duration.text}
                  />
                </ListItem>
              </List>
            </CardContent>
            <CardActions>
              <Button variant="contained" onClick={createRoute} fullWidth>
                Adicionar Rota
              </Button>
            </CardActions>
          </Card>
        )}
      </Grid2>

      <Grid2 id="map" ref={mapContainerRef} xs={8}></Grid2>
      <Snackbar
        open={openMessage}
        autoHideDuration={3000}
        onClose={() => setOpenMessage(false)}
      >
        <Alert onClose={() => setOpenMessage(false)} severity="success">
          Rota cadastrada com sucesso
        </Alert>
      </Snackbar>
    </Grid2>
  )
}
