export const TENANT_ACTIVE = 'active'
export const TENANT_PASSIVE = 'passive'
export const TENANT_SUSPENDED = 'suspended'

// `confirm` is asked before switching to that status, since it signs the company's users out.
export const TENANT_STATUSES = [
  { id: TENANT_ACTIVE, label: 'Aktiv', tone: 'success' },
  {
    id: TENANT_PASSIVE,
    label: 'Passiv',
    tone: 'warning',
    confirm: 'Şirkət passiv ediləcək və istifadəçiləri sistemə daxil ola bilməyəcək.',
  },
  {
    id: TENANT_SUSPENDED,
    label: 'Dondurulub',
    tone: 'danger',
    confirm: 'Şirkətin hesabı dondurulacaq və istifadəçiləri dərhal sistemdən çıxarılacaq.',
  },
]

export function tenantStatus(id) {
  return TENANT_STATUSES.find((status) => status.id === id) ?? TENANT_STATUSES[0]
}

export const ACTIVITY_LABELS = {
  sale: 'Satış',
  purchase: 'Alış',
  expense: 'Xərc',
}

export const DOCUMENT_STATUS_LABELS = {
  draft: 'Qaralama',
  approved: 'Təsdiqlənib',
}
