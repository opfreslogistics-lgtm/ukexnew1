'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Upload, File, Download, Trash2, ArrowLeft, Folder as FolderIcon, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface FolderFile {
  id: string
  name: string
  size: number
  mime_type: string
  file_url: string
  uploaded_at: string
}

export default function FolderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const folderId = params.id as string
  const [folder, setFolder] = useState<any>(null)
  const [files, setFiles] = useState<FolderFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    loadFolder()
    loadFiles()
  }, [folderId])

  const loadFolder = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('id', folderId)
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      setFolder(data)
    } catch (error: any) {
      console.error('Error loading folder:', error)
      toast.error('Failed to load folder')
      router.push('/vault/folders')
    } finally {
      setIsLoading(false)
    }
  }

  const loadFiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('folder_files')
        .select('*')
        .eq('folder_id', folderId)
        .order('uploaded_at', { ascending: false })

      if (error) throw error
      setFiles(data || [])
    } catch (error: any) {
      console.error('Error loading files:', error)
    }
  }

  const processFileUpload = async (file: File) => {
    if (!file) return

    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Upload to Supabase Storage
      // Use folderId directly as the path prefix
      const fileName = `${Date.now()}-${file.name}`
      const filePath = `${folderId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('folder-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        if (uploadError.message.includes('Bucket not found')) {
          toast.error('Storage bucket not configured. Please set up the "folder-files" bucket in Supabase Storage.')
          return
        }
        if (uploadError.message.includes('row-level security')) {
          toast.error('Storage permissions not configured. Please check storage bucket policies in Supabase Dashboard.')
          return
        }
        throw uploadError
      }

      // Get signed URL (valid for 1 year) for private bucket
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('folder-files')
        .createSignedUrl(filePath, 31536000) // 1 year in seconds

      if (urlError) {
        // Fallback to public URL if signed URL fails
        const { data: { publicUrl } } = supabase.storage
          .from('folder-files')
          .getPublicUrl(filePath)
        
        // Save file metadata to database
        const { error: insertError } = await supabase
          .from('folder_files')
          .insert({
            folder_id: folderId,
            name: file.name,
            size: file.size,
            mime_type: file.type,
            file_url: publicUrl,
          })

        if (insertError) throw insertError
      } else {
        // Save file metadata to database with signed URL
        const { error: insertError } = await supabase
          .from('folder_files')
          .insert({
            folder_id: folderId,
            name: file.name,
            size: file.size,
            mime_type: file.type,
            file_url: signedUrlData.signedUrl,
          })

        if (insertError) throw insertError
      }

      toast.success('File uploaded successfully')
      setShowUploadModal(false)
      loadFiles()
    } catch (error: any) {
      console.error('Error uploading file:', error)
      toast.error(error.message || 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await processFileUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      await processFileUpload(file)
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    try {
      const file = files.find(f => f.id === fileId)
      if (!file) return

      // Delete from storage
      // Extract the path from the URL
      const urlParts = file.file_url.split('/folder-files/')
      if (urlParts.length > 1) {
        const filePath = urlParts[1]
        await supabase.storage
          .from('folder-files')
          .remove([filePath])
          .catch((err) => {
            console.error('Error deleting from storage:', err)
          })
      }

      // Delete from database
      const { error } = await supabase
        .from('folder_files')
        .delete()
        .eq('id', fileId)

      if (error) throw error

      toast.success('File deleted')
      setFileToDelete(null)
      loadFiles()
    } catch (error: any) {
      console.error('Error deleting file:', error)
      toast.error('Failed to delete file')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-pink-500 dark:border-pink-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!folder) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Folder not found</p>
        <Link href="/vault/folders">
          <Button>Back to Folders</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/vault/folders">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
              <ArrowLeft size={18} />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FolderIcon className="text-orange-500" size={32} />
              {folder.name}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {files.length} {files.length === 1 ? 'file' : 'files'}
            </p>
          </div>
        </div>
        <Button 
          onClick={() => setShowUploadModal(true)}
          className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 flex items-center gap-2"
        >
          <Upload size={18} />
          Upload File
        </Button>
      </div>

      {/* Files Grid */}
      {files.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 text-center py-20">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-500 dark:to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <File className="text-white" size={40} />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-2 font-medium">No files in this folder</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">Upload your first file to get started</p>
          <Button 
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl"
          >
            <Upload size={18} />
            Upload Your First File
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                  <File className="text-white" size={28} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{file.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {formatFileSize(file.size)} • {new Date(file.uploaded_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        try {
                          // If URL is expired or doesn't work, generate a new signed URL
                          let downloadUrl = file.file_url
                          
                          // Check if URL is from storage (contains /storage/)
                          if (file.file_url.includes('/storage/')) {
                            // Extract file path from URL
                            const urlParts = file.file_url.split('/folder-files/')
                            if (urlParts.length > 1) {
                              const filePath = urlParts[1].split('?')[0]
                              // Generate new signed URL
                              const { data: signedData, error: urlError } = await supabase.storage
                                .from('folder-files')
                                .createSignedUrl(filePath, 3600) // 1 hour
                              
                              if (!urlError && signedData) {
                                downloadUrl = signedData.signedUrl
                              }
                            }
                          }
                          
                          // Create temporary link and trigger download
                          const link = document.createElement('a')
                          link.href = downloadUrl
                          link.download = file.name
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        } catch (error: any) {
                          console.error('Error downloading file:', error)
                          toast.error('Failed to download file')
                        }
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105"
                    >
                      <Download size={14} />
                      Download
                    </button>
                    <button
                      onClick={() => setFileToDelete(file.id)}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false)
          setIsDragging(false)
        }}
        title="Upload File"
        size="md"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Upload className="text-white" size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Choose a file to upload</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select a file from your device to add to this folder
            </p>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 group ${
              isDragging
                ? 'border-pink-500 dark:border-pink-400 bg-pink-50 dark:bg-pink-900/20 scale-105'
                : 'border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <label 
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className={`w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mb-3 transition-transform ${
                  isDragging ? 'scale-125' : 'group-hover:scale-110'
                }`}>
                  <Upload className="text-white" size={24} />
                </div>
                <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {isDragging ? (
                    <span className="text-pink-600 dark:text-pink-400">Drop file here</span>
                  ) : (
                    <>
                      <span className="text-pink-600 dark:text-pink-400">Click to upload</span> or drag and drop
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Any file type (MAX. 10MB)
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
            
          {uploading && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Uploading file...
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
            <Button
              variant="ghost"
              onClick={() => setShowUploadModal(false)}
              disabled={uploading}
              className="flex-1 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!fileToDelete}
        onClose={() => setFileToDelete(null)}
        onConfirm={() => fileToDelete && handleDeleteFile(fileToDelete)}
        title="Delete File"
        message="Are you sure you want to delete this file? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}

