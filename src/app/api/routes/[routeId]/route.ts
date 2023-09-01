import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { routeId: string } }
) {
  const id = params.routeId
  const response = await fetch(
    `http://host.docker.internal:3000/routes/${id}`,
    {
      next: {
        revalidate: 60,
      },
    }
  )
  return NextResponse.json(await response.json())
}

export async function POST(req: Request) {
  const response = await fetch(`http://host.docker.internal:3000/routes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(await req.json()),
  })
  revalidateTag('routes')
  return NextResponse.json(await response.json())
}
