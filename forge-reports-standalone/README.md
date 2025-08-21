# ForgeReports - Versão Standalone

Uma versão autônoma do sistema ForgeReports que pode ser executada diretamente no navegador, sem necessidade de servidor ou configuração adicional.

## 🚀 Como usar

### Método 1: Abrir diretamente
1. Extraia os arquivos em qualquer pasta
2. Abra o arquivo `index.html` no seu navegador
3. Navegue pelas páginas usando os links do menu

### Método 2: Servidor local (recomendado)
Para evitar problemas de CORS e ter uma experiência melhor:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (se tiver npx instalado)
npx serve .

# PHP
php -S localhost:8000
```

Depois acesse `http://localhost:8000` no navegador.

## 📁 Estrutura dos Arquivos

```
forge-reports-standalone/
├── index.html          # Dashboard principal
├── connections.html    # Gerenciamento de conexões
├── reports.html        # Gerenciamento de relatórios
├── users.html         # Gerenciamento de usuários
├── css/
│   └── style.css      # Estilos personalizados
├── js/
│   └── script.js      # Scripts JavaScript
└── README.md          # Este arquivo
```

## 🎨 Funcionalidades

### Visão Técnico (Admin)
- **Dashboard**: Visão geral do sistema com estatísticas
- **Relatórios**: Interface para gerenciar queries SQL
- **Conexões**: Gerenciamento de bancos de dados
- **Usuários**: Controle de acesso e permissões

### Visão Usuário
- **Dashboard**: Interface simplificada para usuários
- **Meus Relatórios**: Relatórios disponíveis para execução
- **Favoritos**: Relatórios marcados como favoritos
- **Histórico**: Execuções anteriores

## 🔧 Características Técnicas

### Design
- **Glassmorphism**: Efeito de vidro moderno
- **Gradientes Líquidos**: Animações fluidas de fundo
- **Responsivo**: Adaptável para desktop e mobile
- **Dark Theme**: Tema escuro elegante

### Interatividade
- **Modais**: Para criação e edição
- **Notificações**: Sistema de feedback visual
- **Filtros**: Busca e filtros em tempo real
- **Atalhos**: Suporte a atalhos de teclado

### Tecnologias
- **HTML5**: Estrutura semântica
- **CSS3**: Estilos avançados com Tailwind CSS
- **JavaScript**: Interatividade e funcionalidades
- **Font Awesome**: Ícones vetoriais
- **Google Fonts**: Tipografia moderna

## 🎯 Funcionalidades Demonstradas

### Dashboard
- Estatísticas em tempo real
- Atividade recente
- Status do sistema
- Acesso rápido às funcionalidades

### Relatórios
- Visualização em cards
- Preview de queries SQL
- Sistema de pastas
- Execução simulada

### Conexões
- Diferentes tipos de banco
- Status de conexão
- Teste de conectividade
- Configuração detalhada

### Usuários
- Diferentes níveis de acesso
- Status online/offline
- Convites por email
- Gerenciamento de permissões

## 🔄 Alternância de Visões

Use o botão no canto superior direito para alternar entre:
- **Visão Técnico**: Interface completa de administração
- **Visão Usuário**: Interface simplificada para usuários finais

## ⌨️ Atalhos de Teclado

- `Ctrl + K`: Focar na busca
- `Ctrl + R`: Novo relatório
- `Ctrl + D`: Nova conexão
- `Ctrl + U`: Novo usuário

## 🎨 Personalização

### Cores
Para alterar as cores principais, edite o arquivo `css/style.css`:

```css
/* Gradiente principal */
.liquid-gradient {
    background: linear-gradient(-45deg, #sua-cor1, #sua-cor2, #sua-cor3);
}

/* Texto gradiente */
.gradient-text {
    background: linear-gradient(135deg, #sua-cor1, #sua-cor2);
}
```

### Funcionalidades
Para adicionar novas funcionalidades, edite o arquivo `js/script.js` e adicione suas funções personalizadas.

## 🌐 Compatibilidade

### Navegadores Suportados
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Recursos Utilizados
- CSS Grid e Flexbox
- CSS Custom Properties
- ES6+ JavaScript
- Fetch API (para futuras integrações)

## 🔮 Próximos Passos

Para transformar esta versão standalone em um sistema funcional:

1. **Backend**: Integre com Django, Flask ou Node.js
2. **Banco de Dados**: Configure PostgreSQL, MySQL ou MongoDB
3. **Autenticação**: Implemente sistema de login
4. **API**: Crie endpoints para as funcionalidades
5. **Deploy**: Configure em servidor de produção

## 📝 Notas Importantes

- Esta é uma versão de demonstração visual
- As funcionalidades são simuladas com JavaScript
- Para uso em produção, integre com um backend real
- Os dados mostrados são fictícios para demonstração

## 🆘 Suporte

Para dúvidas ou sugestões sobre esta versão standalone:
- Consulte o código-fonte nos arquivos HTML/CSS/JS
- Verifique o console do navegador para logs
- Teste em diferentes navegadores para compatibilidade

---

**ForgeReports Standalone** - Visualize o futuro dos seus relatórios! 🚀

