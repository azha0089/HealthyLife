// Email service: send emails via Google Apps Script Web App
// Usage: set VITE_GAS_EMAIL_WEBAPP_URL in your environment, or pass overrideUrl in options

const DEFAULT_TIMEOUT_MS = 15000

function getWebAppUrl(overrideUrl) {
  if (overrideUrl && typeof overrideUrl === 'string') return overrideUrl
  // Prefer env var
  const envUrl = import.meta?.env?.VITE_GAS_EMAIL_WEBAPP_URL
  if (envUrl && typeof envUrl === 'string') return envUrl
  return null
}

export async function sendEmail({ to, subject, html, attachments = [], webAppUrl, timeoutMs = DEFAULT_TIMEOUT_MS, useNoCors = true }) {
  const url = getWebAppUrl(webAppUrl)
  if (!url) {
    console.warn('[emailService] Web App URL not configured: set VITE_GAS_EMAIL_WEBAPP_URL')
    return { success: false, message: 'Email service not configured' }
  }

  if (!to || !subject) {
    return { success: false, message: 'Missing required fields: to, subject' }
  }

  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const payload = { to, subject, html, attachments }
    console.debug('[emailService] sending email', { to, subject, url, useNoCors })

    // Use a CORS-preflight-free request by default: text/plain + no-cors
    // Force no-cors + text/plain to avoid CORS preflight (Apps Script can't reply to OPTIONS)
    const fetchOptions = {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify(payload),
      signal: controller.signal,
      keepalive: true
    }

    console.debug('[emailService] fetchOptions', fetchOptions)
    const response = await fetch(url, fetchOptions)
    clearTimeout(id)

    // Opaque response (status 0). We cannot read it, treat as best-effort success.
    console.debug('[emailService] sendEmail dispatched (no-cors, opaque response)')
    return { success: true }

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      console.error('[emailService] sendEmail non-OK', { status: response.status, text })
      return { success: false, message: `Email send failed: ${response.status} ${text}` }
    }

    const result = await response.json().catch(async () => {
      const txt = await response.text().catch(() => '')
      console.debug('[emailService] sendEmail response (non-JSON)', txt)
      return { ok: true }
    })
    console.debug('[emailService] sendEmail done', result)
    return { success: !!(result && (result.ok || result.success)), result }
  } catch (error) {
    clearTimeout(id)
    console.error('[emailService] sendEmail error:', error)
    return { success: false, message: error?.message || 'Email send error' }
  }
}

export function buildAuthEmailTemplate({ title, greeting, contentLines = [] }) {
  const lines = Array.isArray(contentLines) ? contentLines : []
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #222;">
    <h2 style="margin: 0 0 12px;">${title}</h2>
    <p style="margin: 0 0 16px;">${greeting}</p>
    ${lines.map(l => `<p style=\"margin:0 0 8px;\">${l}</p>`).join('')}
    <hr style="margin: 16px 0; border: none; border-top: 1px solid #eee;" />
    <p style="margin: 0; font-size: 12px; color: #666;">This is an automated message. Please do not reply.</p>
  </div>
  `
}


