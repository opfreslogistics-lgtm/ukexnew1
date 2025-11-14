'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { User, Camera, Save, Mail, Phone, FileText, Upload, X } from 'lucide-react'
import Image from 'next/image'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }

      setUser(currentUser)

      // Load user profile
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      if (profileData) {
        setProfile(profileData)
        setFormData({
          firstName: profileData.first_name || '',
          lastName: profileData.last_name || '',
          phone: profileData.phone || '',
          bio: profileData.bio || '',
        })
      } else {
        // Create profile if it doesn't exist
        const { data: newProfile } = await supabase
          .from('user_profiles')
          .insert({ user_id: currentUser.id })
          .select()
          .single()
        
        if (newProfile) {
          setProfile(newProfile)
        }
      }
    } catch (error: any) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size must be less than 5MB')
      return
    }

    setIsUploading(true)

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) return

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`
      const filePath = fileName // Store directly in bucket root, not in avatars/ subfolder

      // Delete old avatar if exists
      if (profile?.avatar_url) {
        try {
          // Extract the file path from the URL
          const urlParts = profile.avatar_url.split('/avatars/')
          if (urlParts.length > 1) {
            const oldFilePath = urlParts[1].split('?')[0] // Remove query params
            await supabase.storage
              .from('avatars')
              .remove([oldFilePath])
              .catch(() => {}) // Ignore errors
          }
        } catch (e) {
          // Ignore errors when deleting old file
        }
      }

      // Upload new file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        // If bucket doesn't exist, try to create it or use alternative
        if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('not found')) {
          toast.error('Storage bucket not configured. Please set up the "avatars" bucket in Supabase Storage.')
          throw new Error('Storage bucket not configured')
        }
        if (uploadError.message.includes('row-level security') || uploadError.message.includes('RLS')) {
          toast.error('Storage permissions not configured. Please check storage bucket policies in Supabase Dashboard.')
          throw new Error('Storage permissions not configured')
        }
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: currentUser.id,
          avatar_url: publicUrl,
        }, {
          onConflict: 'user_id'
        })

      if (updateError) throw updateError

      setProfile((prev: any) => ({ ...prev, avatar_url: publicUrl }))
      toast.success('Profile picture updated!')
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) return

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: currentUser.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          bio: formData.bio,
          avatar_url: profile?.avatar_url,
        }, {
          onConflict: 'user_id'
        })

      if (error) throw error

      toast.success('Profile updated successfully!')
      loadProfile()
    } catch (error: any) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const displayName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : user?.email?.split('@')[0] || 'User'

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl">
              <User className="text-white" size={28} />
            </div>
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account settings and personal information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Picture Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-indigo-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-indigo-800/50 p-8 text-center">
              <div className="relative inline-block mb-6">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 shadow-2xl">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={displayName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center">
                      <User className="text-white" size={48} />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-xl cursor-pointer hover:scale-110 transition-transform duration-300 border-4 border-white dark:border-indigo-900">
                  <Camera className="text-white" size={20} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {displayName}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">{user?.email}</p>
              {isUploading && (
                <div className="flex items-center justify-center gap-2 text-sm text-pink-600 dark:text-pink-400">
                  <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </div>
              )}
            </div>
          </div>

          {/* Profile Information Card */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-indigo-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-indigo-800/50 p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FileText className="text-pink-500" size={24} />
                Personal Information
              </h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Mail size={16} className="text-pink-500" />
                    Email
                  </label>
                  <Input
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-50 dark:bg-indigo-950/50"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Email cannot be changed. Contact support if you need to update it.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Phone size={16} className="text-pink-500" />
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full px-5 py-4 border-2 border-gray-200 dark:border-indigo-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-indigo-900/30 backdrop-blur-sm shadow-lg hover:shadow-xl resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="flex-1"
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                  >
                    {isSaving ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save size={18} />
                        Save Changes
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

