import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const text = url.searchParams.get('text')

  const response = await fetch(
    `http://host.docker.internal:3000/places?text=${text}`,
    {
      next: {
        revalidate: 60, //aumentar qndo em produção
      },
    }
  )

  return NextResponse.json(await response.json())
}
