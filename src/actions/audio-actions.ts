'use server'

import { createClient } from '../../utils/supabase/server'
import { revalidatePath } from 'next/cache'

export interface AudioUploadData {
  username?: string | null
  audioname?: string | null
  audio_url?: string | null
  coordinateX?: string | null
  coordinateY?: string | null
  moderated?: boolean | null
  description?: string | null
}

export async function createAudioUpload(audioData: AudioUploadData) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('AudioUpload')
    .insert([audioData])
    .select()
    .single()

  if (error) {
    console.error('Database error inserting audio upload:', error)
    throw new Error(error.message)
  }

  revalidatePath('/')
  return data
}
