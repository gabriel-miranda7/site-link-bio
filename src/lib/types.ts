export interface Profile {
  id: string
  name: string
  subtitle: string
  profile_image: string
  background_color: string
  background_image?: string
  background_gradient?: string
  text_color: string
  button_color: string
  button_text_color: string
  title: string
  created_at: string
  updated_at: string
}

export interface Link {
  id: string
  profile_id: string
  title: string
  url: string
  description?: string
  icon?: string
  background_image?: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Analytics {
  id: string
  link_id?: string
  profile_id: string
  event_type: 'page_view' | 'link_click'
  device_type: string
  user_agent: string
  ip_address: string
  created_at: string
}

export interface User {
  id: string
  email: string
  created_at: string
}

export interface LinkWithAnalytics extends Link {
  click_count: number
}

export interface AnalyticsData {
  total_views: number
  total_clicks: number
  links: LinkWithAnalytics[]
  daily_stats: {
    date: string
    views: number
    clicks: number
  }[]
}