import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 })
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    return NextResponse.json(
      { success: true, message: 'Message received. Thank you!' },
      { status: 200 },
    )
  } catch {
    return NextResponse.json({ error: 'Failed to process request.' }, { status: 500 })
  }
}
