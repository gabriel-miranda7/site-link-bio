'use client'

import { useEffect, useState } from 'react'
import { supabase, trackEvent } from '@/lib/supabase'
import { Profile, Link } from '@/lib/types'
import { ExternalLink } from 'lucide-react'

export default function Home() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Carregar perfil
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .single()

      // Carregar links ativos
      const { data: linksData } = await supabase
        .from('links')
        .select('*')
        .eq('is_active', true)
        .order('order_index')

      if (profileData) {
        setProfile(profileData)
        // Rastrear visualização da página
        trackEvent(profileData.id, 'page_view')
      }
      if (linksData) setLinks(linksData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLinkClick = async (link: Link) => {
    if (!profile) return

    try {
      // Rastrear clique no link
      await trackEvent(profile.id, 'link_click', link.id)
      // Abrir link em nova aba
      window.open(link.url, '_blank')
    } catch (error) {
      console.error('Erro ao rastrear clique:', error)
      // Ainda abrir o link mesmo se o rastreamento falhar
      window.open(link.url, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Perfil não encontrado</h1>
          <p className="text-gray-600">Configure seu perfil no painel administrativo.</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        backgroundColor: profile.background_gradient ? undefined : profile.background_color,
        backgroundImage: profile.background_gradient || (profile.background_image ? `url(${profile.background_image})` : undefined),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: profile.text_color
      }}
    >
      <div className="max-w-md w-full space-y-8">
        {/* Profile Section */}
        <div className="text-center">
          {profile.profile_image && (
            <img
              src={profile.profile_image}
              alt={profile.name}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-white/20"
            />
          )}
          <h1 className="text-2xl font-bold mb-2">{profile.name}</h1>
          <p className="text-lg opacity-90">{profile.subtitle}</p>
        </div>

        {/* Links Section */}
        <div className="space-y-4">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link)}
              className="w-full p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-white/10"
              style={{
                backgroundColor: link.background_image ? 'transparent' : profile.button_color + '80',
                backgroundImage: link.background_image ? `url(${link.background_image})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: profile.button_text_color
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ExternalLink className="w-5 h-5" />
                  <span className="font-medium">{link.title}</span>
                </div>
                <ExternalLink className="w-4 h-4 opacity-60" />
              </div>
              {link.description && (
                <p className="text-sm opacity-80 mt-1 text-left">{link.description}</p>
              )}
            </button>
          ))}

          {links.length === 0 && (
            <div className="text-center py-8">
              <p className="text-lg opacity-60">Nenhum link ativo ainda</p>
              <p className="text-sm opacity-40 mt-2">Adicione links no painel administrativo</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p
            className="text-xs opacity-60"
            style={{ color: profile.text_color }}
          >
            Criado com Lasy.Ai
          </p>
        </div>
      </div>
    </div>
  )
}