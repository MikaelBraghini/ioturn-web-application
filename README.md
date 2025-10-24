# IoTurn - Plataforma de Monitoramento IoT

Uma plataforma completa para monitoramento e gerenciamento de dispositivos IoT industriais.

## 🔐 Sistema de Autenticação

### Visão Geral

A plataforma implementa um fluxo de autenticação externa seguro que simula integração com provedores de autenticação externos (OAuth 2.0 style).

### Fluxo de Login

1. **Homepage** → Usuário clica no botão "Login"
2. **Página de Login Externa** (`/auth/login`) → Usuário insere credenciais
3. **Validação Externa** → Sistema valida credenciais (simulado)
4. **Callback** (`/auth/callback`) → Processa código de autorização
5. **Criação de Sessão** → Token seguro armazenado em cookie HTTP-only
6. **Redirecionamento** → Usuário é redirecionado para a plataforma

### Componentes de Autenticação

#### Biblioteca de Autenticação (`lib/auth.ts`)
- `createSessionToken()` - Cria tokens de sessão seguros
- `validateSessionToken()` - Valida e decodifica tokens
- `setSessionCookie()` - Define cookie HTTP-only seguro
- `getSession()` - Recupera sessão atual
- `getCurrentUser()` - Obtém usuário autenticado
- `clearSession()` - Remove sessão (logout)
- `validateExternalAuth()` - Simula validação com provedor externo

#### Middleware (`middleware.ts`)
- Protege rotas que requerem autenticação
- Redireciona usuários não autenticados para login
- Redireciona usuários autenticados para dashboard se tentarem acessar páginas de auth
- Preserva URL de destino original para redirecionamento pós-login

#### Rotas Protegidas
- `/monitoramento/*` - Dashboard e monitoramento
- `/cadastro/*` - Cadastros e gerenciamento
- `/relatorios/*` - Relatórios
- `/configuracoes/*` - Configurações

#### API Routes

**POST `/api/auth/external-login`**
- Simula autenticação com provedor externo
- Retorna código de autorização e state
- Em produção: redirecionaria para provedor OAuth real

**POST `/api/auth/callback`**
- Valida código de autorização
- Cria sessão do usuário
- Define cookie seguro

**POST `/api/auth/logout`**
- Remove sessão do usuário
- Limpa cookies

**GET `/api/auth/me`**
- Retorna usuário autenticado atual
- Usado pelo AuthProvider para manter estado

#### Componentes React

**`AuthProvider`** (`components/auth-provider.tsx`)
- Context provider para estado de autenticação global
- Hook `useAuth()` para acessar usuário e funções de auth
- Carrega usuário automaticamente ao montar
- Fornece função `logout()` e `refreshUser()`

**`UserMenu`** (`components/user-menu.tsx`)
- Menu dropdown com informações do usuário
- Avatar com iniciais
- Links para perfil e configurações
- Botão de logout

### Segurança

#### Implementado
- ✅ Cookies HTTP-only (não acessíveis via JavaScript)
- ✅ Cookies com flag Secure em produção
- ✅ SameSite=Lax para proteção CSRF
- ✅ Validação de tokens em todas as requisições
- ✅ Expiração de sessão (7 dias)
- ✅ Middleware para proteção de rotas
- ✅ Redirecionamento seguro pós-login

#### Para Produção
- 🔄 Substituir simulação por provedor OAuth real (Auth0, Okta, etc.)
- 🔄 Usar JWT com assinatura criptográfica (HS256/RS256)
- 🔄 Implementar refresh tokens
- 🔄 Adicionar rate limiting nas rotas de auth
- 🔄 Implementar 2FA (autenticação de dois fatores)
- 🔄 Logs de auditoria para eventos de autenticação
- 🔄 Proteção contra brute force
- 🔄 Validação de força de senha
- 🔄 Recuperação de senha via email

### Uso

#### Verificar Autenticação em Componentes

\`\`\`typescript
'use client'

import { useAuth } from '@/components/auth-provider'

export function MyComponent() {
  const { user, isLoading, logout } = useAuth()
  
  if (isLoading) return <div>Carregando...</div>
  if (!user) return <div>Não autenticado</div>
  
  return (
    <div>
      <p>Olá, {user.name}!</p>
      <button onClick={logout}>Sair</button>
    </div>
  )
}
\`\`\`

#### Verificar Autenticação em Server Components

\`\`\`typescript
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  return <div>Olá, {user.name}!</div>
}
\`\`\`

#### Verificar Autenticação em Route Handlers

\`\`\`typescript
import { getCurrentUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await getCurrentUser()
  
  if (!user) {
    return NextResponse.json(
      { error: 'Não autenticado' },
      { status: 401 }
    )
  }
  
  return NextResponse.json({ data: 'Protected data' })
}
\`\`\`

### Integração com Provedor Externo Real

Para integrar com um provedor OAuth real (Auth0, Okta, Google, etc.):

1. **Configurar Provedor**
   - Registrar aplicação no provedor
   - Obter Client ID e Client Secret
   - Configurar URLs de callback

2. **Atualizar `/api/auth/external-login`**
   - Redirecionar para URL de autorização do provedor
   - Incluir client_id, redirect_uri, scope, state

3. **Atualizar `/api/auth/callback`**
   - Trocar código por access token com provedor
   - Buscar informações do usuário
   - Criar sessão local

4. **Variáveis de Ambiente**
   \`\`\`env
   AUTH_PROVIDER_CLIENT_ID=your_client_id
   AUTH_PROVIDER_CLIENT_SECRET=your_client_secret
   AUTH_PROVIDER_ISSUER=https://your-provider.com
   AUTH_CALLBACK_URL=https://your-app.com/auth/callback
   JWT_SECRET=your_secure_random_secret
   \`\`\`

## 🚀 Começando

\`\`\`bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start
\`\`\`

## 📝 Licença

© 2025 IoTurn. Todos os direitos reservados.
