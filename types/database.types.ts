export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      vault_items: {
        Row: {
          id: string
          user_id: string
          item_type: 'credential' | 'card' | 'note' | 'contact' | 'document' | 'passkey'
          title: string
          encrypted_data: string // JSON string with encrypted fields
          folder_id: string | null
          tags: string[]
          is_trashed: boolean
          trashed_at: string | null
          source_link_id: string | null
          submitter_id: string | null
          created_at: string
          updated_at: string
          last_accessed_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['vault_items']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['vault_items']['Row'], 'id' | 'created_at'>>
      }
      folders: {
        Row: {
          id: string
          user_id: string
          name: string
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['folders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['folders']['Row'], 'id' | 'created_at'>>
      }
      shared_items: {
        Row: {
          id: string
          item_id: string
          owner_id: string
          shared_with_id: string
          permission: 'view' | 'reveal' | 'edit' | 'owner'
          created_at: string
          revoked_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['shared_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['shared_items']['Row']>
      }
      collection_links: {
        Row: {
          id: string
          owner_id: string
          link_type: 'one-time' | 'multi-use'
          item_type: string
          allowed_fields: string[] // JSON array
          expires_at: string
          max_uses: number | null
          current_uses: number
          passphrase_hash: string | null
          requires_auth: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['collection_links']['Row'], 'id' | 'created_at' | 'current_uses'>
        Update: Partial<Database['public']['Tables']['collection_links']['Row']>
      }
      collection_submissions: {
        Row: {
          id: string
          link_id: string
          submitter_id: string
          encrypted_data: string
          submitted_at: string
        }
        Insert: Omit<Database['public']['Tables']['collection_submissions']['Row'], 'id' | 'submitted_at'>
        Update: never
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string
          item_id: string | null
          action: 'reveal' | 'copy' | 'share' | 'create' | 'update' | 'delete' | 'restore' | 'submit'
          metadata: Json
          ip_address: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>
        Update: never
      }
      email_aliases: {
        Row: {
          id: string
          user_id: string
          alias: string
          linked_item_id: string | null
          is_active: boolean
          created_at: string
          last_used_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['email_aliases']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['email_aliases']['Row']>
      }
      passkeys: {
        Row: {
          id: string
          user_id: string
          item_id: string | null
          credential_id: string
          public_key: string
          device_name: string
          created_at: string
          last_used_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['passkeys']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['passkeys']['Row']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      item_type: 'credential' | 'card' | 'note' | 'contact' | 'document' | 'passkey'
      permission_type: 'view' | 'reveal' | 'edit' | 'owner'
    }
  }
}

