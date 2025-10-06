'use client'

import { useState, useEffect } from 'react'
import { getAnalytics } from '@/lib/supabase'
import { Link } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  BarChart3, 
  Eye, 
  MousePointer, 
  Calendar,
  TrendingUp,
  Smartphone,
  Monitor
} from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'

interface AnalyticsProps {
  analytics: any[]
  links: Link[]
}

export default function Analytics({ analytics: initialAnalytics, links }: AnalyticsProps) {
  const [analytics, setAnalytics] = useState(initialAnalytics)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)

  // Definir datas padrão (últimos 30 dias)
  useEffect(() => {
    const today = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)
    
    setEndDate(today.toISOString().split('T')[0])
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0])
  }, [])

  const handleFilterAnalytics = async () => {
    setLoading(true)
    try {
      const filteredData = await getAnalytics('550e8400-e29b-41d4-a716-446655440000', startDate, endDate + 'T23:59:59')
      setAnalytics(filteredData)
    } catch (error) {
      console.error('Erro ao filtrar analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calcular estatísticas
  const totalViews = analytics.filter(a => a.event_type === 'page_view').length
  const totalClicks = analytics.filter(a => a.event_type === 'link_click').length
  const mobileViews = analytics.filter(a => a.device_type === 'mobile').length
  const desktopViews = analytics.filter(a => a.device_type === 'desktop').length

  // Estatísticas por link
  const linkStats = links.map(link => {
    const clicks = analytics.filter(a => 
      a.event_type === 'link_click' && a.link_id === link.id
    ).length
    return {
      ...link,
      clicks
    }
  }).sort((a, b) => b.clicks - a.clicks)

  // Estatísticas diárias
  const getDailyStats = () => {
    const dailyData: { [key: string]: { views: number, clicks: number } } = {}
    
    analytics.forEach(event => {
      const date = new Date(event.created_at).toISOString().split('T')[0]
      if (!dailyData[date]) {
        dailyData[date] = { views: 0, clicks: 0 }
      }
      
      if (event.event_type === 'page_view') {
        dailyData[date].views++
      } else if (event.event_type === 'link_click') {
        dailyData[date].clicks++
      }
    })

    return Object.entries(dailyData)
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14) // Últimos 14 dias
  }

  const dailyStats = getDailyStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Analytics</h2>
        <p className="text-gray-600">Acompanhe o desempenho dos seus links</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Filtrar por Período</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Inicial</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Final</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleFilterAnalytics}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>{loading ? 'Carregando...' : 'Filtrar'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Visualizações
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">
              Visualizações da página
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Cliques
            </CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks}</div>
            <p className="text-xs text-muted-foreground">
              Cliques nos links
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mobile
            </CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mobileViews}</div>
            <p className="text-xs text-muted-foreground">
              {totalViews > 0 ? Math.round((mobileViews / totalViews) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Desktop
            </CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{desktopViews}</div>
            <p className="text-xs text-muted-foreground">
              {totalViews > 0 ? Math.round((desktopViews / totalViews) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance por Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Performance por Link</span>
          </CardTitle>
          <CardDescription>
            Cliques em cada link ordenados por popularidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {linkStats.map((link, index) => (
              <div key={link.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium">{link.title}</h3>
                    <p className="text-sm text-gray-600">{link.url}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{link.clicks}</div>
                  <p className="text-xs text-gray-500">cliques</p>
                </div>
              </div>
            ))}

            {linkStats.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum dado de cliques ainda</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico Diário */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Diária (Últimos 14 dias)</CardTitle>
          <CardDescription>
            Visualizações e cliques por dia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dailyStats.map((day) => (
              <div key={day.date} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="font-medium">
                  {formatDate(day.date)}
                </div>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">{day.views} visualizações</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MousePointer className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{day.clicks} cliques</span>
                  </div>
                </div>
              </div>
            ))}

            {dailyStats.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum dado para o período selecionado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Eventos Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>
            Últimos eventos registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.slice(0, 10).map((event, index) => {
              const link = links.find(l => l.id === event.link_id)
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {event.event_type === 'page_view' ? (
                      <Eye className="w-4 h-4 text-blue-600" />
                    ) : (
                      <MousePointer className="w-4 h-4 text-green-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {event.event_type === 'page_view' 
                          ? 'Visualização da página' 
                          : `Clique em "${link?.title || 'Link removido'}"`
                        }
                      </p>
                      <p className="text-xs text-gray-500">
                        {event.device_type === 'mobile' ? 'Mobile' : 'Desktop'}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDateTime(event.created_at)}
                  </div>
                </div>
              )
            })}

            {analytics.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma atividade registrada ainda</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}