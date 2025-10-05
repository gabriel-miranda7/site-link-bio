'use client'

import { useEffect, useState } from 'react'
import { supabase, trackEvent } from '@/lib/supabase'
import { Profile, Link } from '@/lib/types'
import { ExternalLink, Instagram, Twitter, Youtube, Github, Linkedin, Mail, Globe, Heart } from 'lucide-react'
import Image from 'next/image'

// Dados de exemplo para demonstração
const defaultProfile: Profile = {
  id: '1',
  name: 'Seu Nome',
  subtitle: 'Criador de Conteúdo',
  profile_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
  background_color: '#1a1a1a',
  background_image: '',
  text_color: '#ffffff',
  button_color: '#333333',
  button_text_color: '#ffffff',
  title: 'Meus Links',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const defaultLinks: Link[] = [
  {
    id: '1',
    profile_id: '1',
    title: 'Instagram',
    url: 'https://instagram.com',
    description: 'Siga-me no Instagram',
    icon: 'instagram',
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    profile_id: '1',
    title: 'YouTube',
    url: 'https://youtube.com',
    description: 'Meu canal no YouTube',
    icon: 'youtube',
    order_index: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    profile_id: '1',
    title: 'Site Pessoal',
    url: 'https://example.com',
    description: 'Visite meu site oficial',
    icon: 'globe',
    order_index: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

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
  const [profile, setProfile] = useState<Profile>(defaultProfile)
  const [links, setLinks] = useState<Link[]>(defaultLinks)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
    // Rastrear visualização da página
    trackEvent('1', 'page_view')
  }, [])

  async function loadProfile() {
    try {
      // Tentar carregar dados do Supabase
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .single()

      const { data: linksData } = await supabase
        .from('links')
        .select('*')
        .eq('is_active', true)
        .order('order_index')

      if (profileData) setProfile(profileData)
      if (linksData && linksData.length > 0) setLinks(linksData)
    } catch (error) {
      console.log('Usando dados de exemplo')
    } finally {
      setLoading(false)
    }
  }

  const handleLinkClick = async (link: Link) => {
    // Rastrear clique no link
    await trackEvent(profile.id, 'link_click', link.id)
    // Abrir link em nova aba
    window.open(link.url, '_blank')
  }

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || ExternalLink
    return <IconComponent className="w-6 h-6" />
  }

  const backgroundStyle = profile.background_image 
    ? { 
        backgroundImage: `url(${profile.background_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : { backgroundColor: profile.background_color }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen py-8 px-4"
      style={backgroundStyle}
    >
      {profile.background_image && (
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
                src={profile.profile_image}
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
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link)}
              className="w-full p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-white/10"
              style={{ 
                backgroundColor: profile.button_color + '80',
                color: profile.button_text_color 
              }}
            >
              <div className="flex items-center space-x-4">
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
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p 
            className="text-xs opacity-60"
            style={{ color: profile.text_color }}
          >
            Criado com ❤️
          </p>
        </div>
      </div>
    </div>
  )
}