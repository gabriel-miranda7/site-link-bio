'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Link } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  GripVertical,
  ExternalLink,
  Instagram,
  Twitter,
  Youtube,
  Github,
  Linkedin,
  Mail,
  Globe,
  Heart
} from 'lucide-react'

interface LinkManagerProps {
  links: Link[]
  onLinksChange: (links: Link[]) => void
  onRefresh: () => void
}

const iconOptions = [
  { value: 'external', label: 'Link Externo', icon: ExternalLink },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'twitter', label: 'Twitter', icon: Twitter },
  { value: 'youtube', label: 'YouTube', icon: Youtube },
  { value: 'github', label: 'GitHub', icon: Github },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'mail', label: 'Email', icon: Mail },
  { value: 'globe', label: 'Website', icon: Globe },
  { value: 'heart', label: 'Favorito', icon: Heart }
]

export default function LinkManager({ links, onLinksChange, onRefresh }: LinkManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [newLink, setNewLink] = useState({
    title: '',
    url: '',
    description: '',
    icon: 'external'
  })

  const handleAddLink = async () => {
    if (!newLink.title || !newLink.url) {
      setMessage('Título e URL são obrigatórios')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const maxOrder = Math.max(...links.map(l => l.order_index), 0)
      
      const linkData = {
        profile_id: '1',
        title: newLink.title,
        url: newLink.url,
        description: newLink.description || null,
        icon: newLink.icon,
        order_index: maxOrder + 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('links')
        .insert(linkData)
        .select()
        .single()

      if (error) throw error

      onLinksChange([...links, data])
      setNewLink({ title: '', url: '', description: '', icon: 'external' })
      setShowAddForm(false)
      setMessage('Link adicionado com sucesso!')
      onRefresh()
    } catch (error) {
      console.error('Erro ao adicionar link:', error)
      setMessage('Erro ao adicionar link')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateLink = async (linkId: string, updatedData: Partial<Link>) => {
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('links')
        .update({
          ...updatedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', linkId)

      if (error) throw error

      const updatedLinks = links.map(link => 
        link.id === linkId ? { ...link, ...updatedData } : link
      )
      onLinksChange(updatedLinks)
      setEditingId(null)
      setMessage('Link atualizado com sucesso!')
      onRefresh()
    } catch (error) {
      console.error('Erro ao atualizar link:', error)
      setMessage('Erro ao atualizar link')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('Tem certeza que deseja excluir este link?')) return

    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', linkId)

      if (error) throw error

      const updatedLinks = links.filter(link => link.id !== linkId)
      onLinksChange(updatedLinks)
      setMessage('Link excluído com sucesso!')
      onRefresh()
    } catch (error) {
      console.error('Erro ao excluir link:', error)
      setMessage('Erro ao excluir link')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (linkId: string, isActive: boolean) => {
    await handleUpdateLink(linkId, { is_active: isActive })
  }

  const getIcon = (iconName: string) => {
    const iconOption = iconOptions.find(opt => opt.value === iconName)
    const IconComponent = iconOption?.icon || ExternalLink
    return <IconComponent className="w-4 h-4" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Links</h2>
          <p className="text-gray-600">Adicione, edite e organize seus links</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Link</span>
        </Button>
      </div>

      {/* Add Link Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Link</CardTitle>
            <CardDescription>
              Adicione um novo link à sua bio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título *</label>
                <Input
                  value={newLink.title}
                  onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Instagram"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">URL *</label>
                <Input
                  value={newLink.url}
                  onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://instagram.com/seuusuario"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Input
                value={newLink.description}
                onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Siga-me no Instagram"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ícone</label>
              <select
                value={newLink.icon}
                onChange={(e) => setNewLink(prev => ({ ...prev, icon: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {iconOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false)
                  setNewLink({ title: '', url: '', description: '', icon: 'external' })
                }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleAddLink}
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar Link'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Links List */}
      <div className="space-y-4">
        {links.map((link) => (
          <Card key={link.id}>
            <CardContent className="p-4">
              {editingId === link.id ? (
                <EditLinkForm 
                  link={link}
                  onSave={(updatedData) => handleUpdateLink(link.id, updatedData)}
                  onCancel={() => setEditingId(null)}
                  loading={loading}
                />
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                    <div className="flex items-center space-x-3">
                      {getIcon(link.icon || 'external')}
                      <div>
                        <h3 className="font-medium">{link.title}</h3>
                        {link.description && (
                          <p className="text-sm text-gray-600">{link.description}</p>
                        )}
                        <p className="text-xs text-gray-400">{link.url}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={link.is_active}
                        onChange={(e) => handleToggleActive(link.id, e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Ativo</span>
                    </label>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(link.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteLink(link.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {links.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Plus className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum link ainda
              </h3>
              <p className="text-gray-600 mb-4">
                Adicione seu primeiro link para começar
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                Adicionar Link
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {message && (
        <div className={`text-sm p-3 rounded-md ${
          message.includes('sucesso') 
            ? 'text-green-600 bg-green-50' 
            : 'text-red-600 bg-red-50'
        }`}>
          {message}
        </div>
      )}
    </div>
  )
}

function EditLinkForm({ 
  link, 
  onSave, 
  onCancel, 
  loading 
}: { 
  link: Link
  onSave: (data: Partial<Link>) => void
  onCancel: () => void
  loading: boolean
}) {
  const [formData, setFormData] = useState({
    title: link.title,
    url: link.url,
    description: link.description || '',
    icon: link.icon || 'external'
  })

  const handleSave = () => {
    if (!formData.title || !formData.url) return
    onSave(formData)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Título</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">URL</label>
          <Input
            value={formData.url}
            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Descrição</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Ícone</label>
        <select
          value={formData.icon}
          onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          {iconOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </div>
  )
}