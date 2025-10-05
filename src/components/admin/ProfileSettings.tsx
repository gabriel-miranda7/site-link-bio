'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, Upload, Palette, Gradient } from 'lucide-react'
import Image from 'next/image'

interface ProfileSettingsProps {
  profile: Profile
  onProfileChange: (profile: Profile) => void
  onRefresh: () => void
}

const gradientPresets = [
  { name: 'Sunset', value: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)' },
  { name: 'Ocean', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Forest', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { name: 'Purple', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Pink', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Blue', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Dark', value: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)' },
  { name: 'Gold', value: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)' }
]

export default function ProfileSettings({ profile, onProfileChange, onRefresh }: ProfileSettingsProps) {
  const [formData, setFormData] = useState(profile)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [backgroundType, setBackgroundType] = useState<'color' | 'image' | 'gradient'>(
    formData.background_gradient ? 'gradient' : 
    formData.background_image ? 'image' : 'color'
  )

  const handleInputChange = (field: keyof Profile, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleBackgroundTypeChange = (type: 'color' | 'image' | 'gradient') => {
    setBackgroundType(type)
    // Limpar outros tipos de fundo
    if (type === 'color') {
      setFormData(prev => ({ ...prev, background_image: '', background_gradient: '' }))
    } else if (type === 'image') {
      setFormData(prev => ({ ...prev, background_gradient: '' }))
    } else if (type === 'gradient') {
      setFormData(prev => ({ ...prev, background_image: '' }))
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          ...formData,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      onProfileChange(formData)
      setMessage('Perfil atualizado com sucesso!')
      onRefresh()
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      setMessage('Erro ao salvar perfil')
    } finally {
      setLoading(false)
    }
  }

  const getPreviewStyle = () => {
    if (backgroundType === 'gradient' && formData.background_gradient) {
      return { background: formData.background_gradient }
    } else if (backgroundType === 'image' && formData.background_image) {
      return {
        backgroundImage: `url(${formData.background_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    } else {
      return { backgroundColor: formData.background_color }
    }
  }

  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Informações Básicas</span>
          </CardTitle>
          <CardDescription>
            Configure as informações principais do seu perfil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título da Página</label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Meus Links"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Seu Nome"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Subtítulo</label>
            <Input
              value={formData.subtitle}
              onChange={(e) => handleInputChange('subtitle', e.target.value)}
              placeholder="Criador de Conteúdo"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">URL da Foto de Perfil</label>
            <Input
              value={formData.profile_image}
              onChange={(e) => handleInputChange('profile_image', e.target.value)}
              placeholder="https://imgur.com/sua-imagem.jpg"
            />
            {formData.profile_image && (
              <div className="mt-2">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                  <Image
                    src={formData.profile_image}
                    alt="Preview"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Personalização Visual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Personalização Visual</span>
          </CardTitle>
          <CardDescription>
            Customize as cores e aparência da sua página
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tipo de Fundo */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Tipo de Fundo</label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="backgroundType"
                  value="color"
                  checked={backgroundType === 'color'}
                  onChange={() => handleBackgroundTypeChange('color')}
                />
                <span className="text-sm">Cor Sólida</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="backgroundType"
                  value="gradient"
                  checked={backgroundType === 'gradient'}
                  onChange={() => handleBackgroundTypeChange('gradient')}
                />
                <span className="text-sm">Gradiente</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="backgroundType"
                  value="image"
                  checked={backgroundType === 'image'}
                  onChange={() => handleBackgroundTypeChange('image')}
                />
                <span className="text-sm">Imagem</span>
              </label>
            </div>
          </div>

          {/* Configurações de Fundo */}
          {backgroundType === 'color' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Cor do Fundo</label>
              <div className="flex space-x-2">
                <Input
                  type="color"
                  value={formData.background_color}
                  onChange={(e) => handleInputChange('background_color', e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={formData.background_color}
                  onChange={(e) => handleInputChange('background_color', e.target.value)}
                  placeholder="#1a1a1a"
                  className="flex-1"
                />
              </div>
            </div>
          )}

          {backgroundType === 'gradient' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Gradiente Personalizado</label>
                <Input
                  value={formData.background_gradient || ''}
                  onChange={(e) => handleInputChange('background_gradient', e.target.value)}
                  placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                />
                <p className="text-xs text-gray-500">
                  Use CSS gradient syntax ou escolha um preset abaixo
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Presets de Gradiente</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {gradientPresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleInputChange('background_gradient', preset.value)}
                      className="h-12 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors relative overflow-hidden"
                      style={{ background: preset.value }}
                    >
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">{preset.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {backgroundType === 'image' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Imagem de Fundo</label>
              <Input
                value={formData.background_image || ''}
                onChange={(e) => handleInputChange('background_image', e.target.value)}
                placeholder="https://imgur.com/sua-imagem-de-fundo.jpg"
              />
              <p className="text-xs text-gray-500">
                URL da imagem que será usada como fundo
              </p>
            </div>
          )}

          {/* Cores dos Elementos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cor do Texto</label>
              <div className="flex space-x-2">
                <Input
                  type="color"
                  value={formData.text_color}
                  onChange={(e) => handleInputChange('text_color', e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={formData.text_color}
                  onChange={(e) => handleInputChange('text_color', e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cor dos Botões</label>
              <div className="flex space-x-2">
                <Input
                  type="color"
                  value={formData.button_color}
                  onChange={(e) => handleInputChange('button_color', e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={formData.button_color}
                  onChange={(e) => handleInputChange('button_color', e.target.value)}
                  placeholder="#333333"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Cor do Texto dos Botões</label>
              <div className="flex space-x-2">
                <Input
                  type="color"
                  value={formData.button_text_color}
                  onChange={(e) => handleInputChange('button_text_color', e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={formData.button_text_color}
                  onChange={(e) => handleInputChange('button_text_color', e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            Veja como sua página ficará
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className="max-w-sm mx-auto p-6 rounded-xl relative overflow-hidden"
            style={getPreviewStyle()}
          >
            {(backgroundType === 'image' || backgroundType === 'gradient') && (
              <div className="absolute inset-0 bg-black/50"></div>
            )}
            
            <div className="relative z-10 text-center space-y-4">
              <h1 
                className="text-lg font-bold"
                style={{ color: formData.text_color }}
              >
                {formData.title}
              </h1>
              
              <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-white/20">
                <Image
                  src={formData.profile_image}
                  alt="Preview"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
                  }}
                />
              </div>

              <div>
                <h2 
                  className="font-semibold"
                  style={{ color: formData.text_color }}
                >
                  {formData.name}
                </h2>
                <p 
                  className="text-sm opacity-80"
                  style={{ color: formData.text_color }}
                >
                  {formData.subtitle}
                </p>
              </div>

              <div 
                className="p-3 rounded-lg"
                style={{ 
                  backgroundColor: formData.button_color + '80',
                  color: formData.button_text_color 
                }}
              >
                <div className="text-sm font-medium">Link de Exemplo</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
        </Button>
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