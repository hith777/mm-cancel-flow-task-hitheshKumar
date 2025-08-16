import { cookies } from 'next/headers'

export async function assertCsrf(request: Request) {
    const header = request.headers.get('x-csrf') || ''
    const jar = await cookies()
    const cookie = jar.get('csrf')?.value || ''
  if (!cookie || !header || cookie !== header) {
    const err = new Error('CSRF failed')
    ;(err as { status?: number }).status = 403
    throw err
  }
}