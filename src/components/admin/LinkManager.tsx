            <div className=\"space-y-2\">
              <label className=\"text-sm font-medium\">Ícone</label>
              <select
                value={newLink.icon}
                onChange={(e) => setNewLink(prev => ({ ...prev, icon: e.target.value }))}
                className=\"w-full p-2 border border-gray-300 rounded-md\"
              >
                {iconOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className=\"space-y-2\">
              <label className=\"text-sm font-medium\">Imagem de Fundo (opcional)</label>
              <Input
                value={newLink.background_image}
                onChange={(e) => setNewLink(prev => ({ ...prev, background_image: e.target.value }))}
                placeholder=\"https://imgur.com/sua-imagem.jpg\"
              />
              <p className=\"text-xs text-gray-500\">
                Deixe em branco para usar apenas a cor padrão
              </p>
            </div>