'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getAnalytics } from '@/lib/supabase'
import { Profile, Link, AnalyticsData } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Settings, 
  Plus, 
  BarChart3, 
  Eye, 
  MousePointer, 
  LogOut,
  Edit,
  Trash2,
  GripVertical
} from 'lucide-react'
import ProfileSettings from '@/components/admin/ProfileSettings'
import LinkManager from '@/components/admin/LinkManager'
import Analytics from '@/components/admin/Analytics'

type ActiveTab = 'overview' | 'links' | 'profile' | 'analytics'

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [links, setLinks] = useState<Link[]>([])
  const [analytics, setAnalytics] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/admin')
        return
      }

      setUser(user)
      await loadData()
    } catch (error) {
      console.error('Erro na autenticação:', error)
      router.push('/admin')
    } finally {
      setLoading(false)
    }
  }

  const loadData = async () => {
    try {
      // Carregar perfil
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .single()

      // Carregar links
      const { data: linksData } = await supabase
        .from('links')
        .select('*')
        .order('order_index')

      // Carregar analytics dos últimos 30 dias
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const analyticsData = await getAnalytics('1', thirtyDaysAgo.toISOString())

      if (profileData) setProfile(profileData)
      if (linksData) setLinks(linksData)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin')
  }

  const getAnalyticsStats = () => {
    const totalViews = analytics.filter(a => a.event_type === 'page_view').length
    const totalClicks = analytics.filter(a => a.event_type === 'link_click').length
    
    return { totalViews, totalClicks }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const { totalViews, totalClicks } = getAnalyticsStats()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                Painel Administrativo
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
              { id: 'links', label: 'Links', icon: Plus },
              { id: 'profile', label: 'Perfil', icon: Settings },
              { id: 'analytics', label: 'Analytics', icon: Eye }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Visualizações
                  </CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalViews}</div>
                  <p className="text-xs text-muted-foreground">
                    Últimos 30 dias
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Cliques
                  </CardTitle>
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalClicks}</div>
                  <p className="text-xs text-muted-foreground">
                    Últimos 30 dias
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Links Ativos
                  </CardTitle>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {links.filter(l => l.is_active).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total de {links.length} links
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Acesse rapidamente as principais funcionalidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => setActiveTab('links')}
                    className="justify-start h-auto p-4"
                    variant="outline"
                  >
                    <Plus className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Adicionar Link</div>
                      <div className="text-sm text-gray-500">
                        Criar um novo link para sua bio
                      </div>
                    </div>
                  </Button>

                  <Button 
                    onClick={() => setActiveTab('profile')}
                    className="justify-start h-auto p-4"
                    variant="outline"
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Personalizar</div>
                      <div className="text-sm text-gray-500">
                        Editar cores, imagens e textos
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'links' && (
          <LinkManager 
            links={links} 
            onLinksChange={setLinks}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'profile' && profile && (
          <ProfileSettings 
            profile={profile} 
            onProfileChange={setProfile}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'analytics' && (
          <Analytics 
            analytics={analytics}
            links={links}
          />
        )}
      </div>
    </div>
  )
}