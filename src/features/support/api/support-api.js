import { apiClient } from '@/services/api-client'

function ticketPath(id) {
  return `/support/tickets/${encodeURIComponent(id)}`
}

// ---- Company users (the chat widget) ----

// GET /api/support/my-tickets → the caller's newest tickets with messages, newest ticket first.
export async function fetchMyTickets() {
  const { items } = await apiClient.get('/support/my-tickets')
  return items
}

// POST /api/support/tickets { message } → the new ticket, already holding the bot's greeting.
export async function createTicket(message) {
  const { ticket } = await apiClient.post('/support/tickets', { message })
  return ticket
}

// POST /api/support/tickets/{id}/messages { message }: a follow-up in an open ticket.
export async function sendTicketMessage(id, message) {
  const { ticket } = await apiClient.post(`${ticketPath(id)}/messages`, { message })
  return ticket
}

// POST /api/support/tickets/{id}/read: the user has seen the team's and the bot's messages (✓✓ for the team).
export async function markMyTicketRead(id) {
  await apiClient.post(`${ticketPath(id)}/read`)
}

// POST /api/support/tickets/{id}/clear: hides the conversation so far from this user's widget (nothing is deleted).
export async function clearMyTicket(id) {
  const { ticket } = await apiClient.post(`${ticketPath(id)}/clear`)
  return ticket
}

// ---- Platform admins (the support desk) ----

// GET /api/support/admin/tickets?status= (active | open | pending | resolved | all). Takes `{ status }` for useApiQuery.
export async function fetchAdminTickets({ status }) {
  const { items } = await apiClient.get('/support/admin/tickets', { params: { status } })
  return items
}

// GET /api/support/admin/tickets/{id}. Takes `{ id }` for useApiQuery.
export async function fetchAdminTicket({ id }) {
  const { ticket } = await apiClient.get(`/support/admin/tickets/${encodeURIComponent(id)}`)
  return ticket
}

// POST /api/support/admin/tickets/{id}/read: the team has seen the user's messages (✓✓ in the widget).
export async function markTeamRead(id) {
  await apiClient.post(`/support/admin/tickets/${encodeURIComponent(id)}/read`)
}

// POST /api/support/admin/tickets/{id}/clear: hides the conversation so far for this admin only.
export async function clearTeamTicket(id) {
  const { ticket } = await apiClient.post(`/support/admin/tickets/${encodeURIComponent(id)}/clear`)
  return ticket
}

// POST /api/support/tickets/{id}/reply { message }
export async function replyToTicket(id, message) {
  const { ticket } = await apiClient.post(`${ticketPath(id)}/reply`, { message })
  return ticket
}

// PUT /api/support/tickets/{id}/resolve
export async function resolveTicket(id) {
  const { ticket } = await apiClient.put(`${ticketPath(id)}/resolve`)
  return ticket
}
