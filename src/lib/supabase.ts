import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Função para rastrear analytics
export async function trackEvent(
  profileId: string,
  eventType: 'page_view' | 'link_click',
  linkId?: string
) {
  try {
    const deviceType = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop'
    
    await supabase.from('analytics').insert({
      profile_id: profileId,
      link_id: linkId,
      event_type: eventType,
      device_type: deviceType,
      user_agent: navigator.userAgent,
      ip_address: 'unknown' // Em produção, você pode usar uma API para obter o IP
    })
  } catch (error) {
    console.error('Erro ao rastrear evento:', error)
  }
}

// Função para obter analytics
export async function getAnalytics(profileId: string, startDate?: string, endDate?: string) {
  try {
    let query = supabase
      .from('analytics')
      .select('*')
      .eq('profile_id', profileId)

    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao obter analytics:', error)
    return []
  }
}