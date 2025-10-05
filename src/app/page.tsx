'use client'

import { useEffect, useState } from 'react'
import { supabase, trackEvent } from '@/lib/supabase'
import { Profile, Link } from '@/lib/types'
import { ExternalLink, Instagram, Twitter, Youtube, Github, Linkedin, Mail, Globe, Heart } from 'lucide-react'
import Image from 'next/image'

const iconMap = {
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  github: Github,
  linkedin: Linkedin,
  mail: Mail,
  globe: Globe,
  heart: Heart,
  external: ExternalLink
}

export default function Home() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    // Rastrear visualização da página
    trackPageView()
  }, [])

  async function loadData() {
    try {
      // Carregar perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
        .single()

      if (profileError) {
        console.error('Erro ao carregar perfil:', profileError)
      } else {
        setProfile(profileData)
      }

      // Carregar links ativos
      const { data: linksData, error: linksError } = await supabase
        .from('links')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true })

      if (linksError) {
        console.error('Erro ao carregar links:', linksError)
      } else {
        setLinks(linksData || [])
      }
    } catch (error) {
      console.error('Erro geral ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  async function trackPageView() {
    try {
      if (profile?.id) {
        await trackEvent(profile.id, 'page_view')
      } else {
        // Se não temos o profile ainda, usar ID padrão
        await trackEvent('550e8400-e29b-41d4-a716-446655440000', 'page_view')
      }
    } catch (error) {
      console.error('Erro ao rastrear page view:', error)
    }
  }

  const handleLinkClick = async (link: Link) => {
    try {
      // Rastrear clique no link
      const profileId = profile?.id || '550e8400-e29b-41d4-a716-446655440000'
      await trackEvent(profileId, 'link_click', link.id)
      
      // Abrir link em nova aba
      window.open(link.url, '_blank')
    } catch (error) {
      console.error('Erro ao rastrear clique:', error)
      // Mesmo com erro no tracking, abrir o link
      window.open(link.url, '_blank')
    }
  }

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || ExternalLink
    return <IconComponent className="w-6 h-6" />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Perfil não encontrado</h1>
          <p className="text-gray-400">Configure seu perfil no painel administrativo</p>
        </div>
      </div>
    )
  }

  // Determinar estilo de fundo (gradiente, imagem ou cor sólida)
  const getBackgroundStyle = () => {
    if (profile.background_gradient) {
      return { background: profile.background_gradient }
    } else if (profile.background_image) {
      return { 
        backgroundImage: `url(${profile.background_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    } else {
      return { backgroundColor: profile.background_color }
    }
  }

  return (
    <div 
      className="min-h-screen py-8 px-4"
      style={getBackgroundStyle()}
    >
      {(profile.background_image || profile.background_gradient) && (
        <div className="absolute inset-0 bg-black/50"></div>
      )}
      
      <div className="relative z-10 max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 
            className="text-2xl font-bold mb-6"
            style={{ color: profile.text_color }}
          >
            {profile.title}
          </h1>
          
          {/* Profile Image */}
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white/20 shadow-lg">
              <Image
                src={profile.profile_image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'}
                alt={profile.name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
                }}
              />
            </div>
          </div>

          {/* Name and Subtitle */}
          <h2 
            className="text-xl font-semibold mb-2"
            style={{ color: profile.text_color }}
          >
            {profile.name}
          </h2>
          <p 
            className="text-sm opacity-80"
            style={{ color: profile.text_color }}
          >
            {profile.subtitle}
          </p>
        </div>

        {/* Links */}
        <div className="space-y-4">
          {links.length > 0 ? (
            links.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link)}
                className="w-full p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-white/10 relative overflow-hidden"
                style={{ 
                  backgroundColor: link.background_image ? 'transparent' : profile.button_color + '80',
                  color: profile.button_text_color 
                }}
              >
                {/* Imagem de fundo do link (opcional) */}
                {link.background_image && (
                  <>
                    <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${link.background_image})` }}
                    />
                    <div className="absolute inset-0 bg-black/60"></div>
                  </>
                )}
                
                <div className="relative z-10 flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getIcon(link.icon || 'external')}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-lg">{link.title}</h3>
                    {link.description && (
                      <p className="text-sm opacity-80">{link.description}</p>
                    )}
                  </div>
                  <ExternalLink className="w-5 h-5 opacity-60" />
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-8">
              <p 
                className="text-lg opacity-80"
                style={{ color: profile.text_color }}
              >
                Nenhum link disponível
              </p>
              <p 
                className="text-sm opacity-60 mt-2"
                style={{ color: profile.text_color }}
              >
                Configure seus links no painel administrativo
              </p>
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