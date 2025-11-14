import { VaultLayout } from '@/components/vault/VaultLayout'

export default function VaultLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return <VaultLayout>{children}</VaultLayout>
}

