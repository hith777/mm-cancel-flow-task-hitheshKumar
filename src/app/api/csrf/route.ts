import { NextResponse } from 'next/server'
import crypto from 'node:crypto'

export async function GET() {
  const token = crypto.randomBytes(16).toString('hex')
  const res = NextResponse.json({ token })
  res.cookies.set('csrf', token, { httpOnly: true, sameSite: 'lax', path: '/' })
  return res
}