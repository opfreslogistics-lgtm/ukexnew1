export type ItemType = 'credential' | 'card' | 'note' | 'contact' | 'document' | 'passkey'

export type Permission = 'view' | 'reveal' | 'edit' | 'owner'

export interface CredentialData {
  username?: string
  email?: string
  password: string
  website?: string
  websites?: string[]
  notes?: string
  customFields?: Record<string, string>
}

export interface CardData {
  title: string
  cardholderName: string
  cardNumber: string
  expirationDate: string
  cvv: string
  cardPin?: string
  zipCode?: string
  notes?: string
  customFields?: Record<string, string>
}

export interface NoteData {
  content: string
  notes?: string
}

export interface ContactData {
  fullName: string
  email?: string
  phone?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  customFields?: Record<string, string>
}

export interface DocumentData {
  filename: string
  fileUrl: string
  fileSize: number
  mimeType: string
  notes?: string
}

export interface PasskeyData {
  credentialId: string
  deviceName: string
  publicKey: string
  notes?: string
}

export type VaultItemData = CredentialData | CardData | NoteData | ContactData | DocumentData | PasskeyData

export interface VaultItem {
  id: string
  userId: string
  itemType: ItemType
  title: string
  encryptedData: string
  folderId: string | null
  tags: string[]
  isTrashed: boolean
  trashedAt: string | null
  sourceLinkId: string | null
  submitterId: string | null
  createdAt: string
  updatedAt: string
  lastAccessedAt: string | null
}

export interface Folder {
  id: string
  userId: string
  name: string
  parentId: string | null
  createdAt: string
  updatedAt: string
}

export interface SharedItem {
  id: string
  itemId: string
  ownerId: string
  sharedWithId: string
  permission: Permission
  createdAt: string
  revokedAt: string | null
}

export interface CollectionLink {
  id: string
  ownerId: string
  linkType: 'one-time' | 'multi-use'
  itemType: ItemType
  allowedFields: string[]
  expiresAt: string
  maxUses: number | null
  currentUses: number
  passphraseHash: string | null
  requiresAuth: boolean
  websiteUrl?: string | null
  siteName?: string | null
  siteTagline?: string | null
  customFaviconUrl?: string | null
  createdAt: string
}

export interface PasswordHealth {
  weak: number
  reused: number
  exposed: number
  old: number
  total: number
}

