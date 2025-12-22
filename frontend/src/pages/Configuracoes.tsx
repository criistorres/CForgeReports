import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Settings,
    Mail,
    Server,
    Lock,
    Send,
    CheckCircle2,
    XCircle,
    Loader2,
    Shield,
    ArrowLeft,
    Eye,
    EyeOff
} from 'lucide-react'
import api from '@/services/api'
import { AppLayout } from '@/components/layout/AppLayout'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

interface ConfiguracaoEmail {
    smtp_host: string
    smtp_porta: number
    smtp_usuario: string
    smtp_senha_configurada: boolean
    smtp_usar_tls: boolean
    smtp_email_remetente: string
    smtp_nome_remetente: string
    smtp_testado_em: string | null
    smtp_ultimo_teste_ok: boolean
    smtp_configurado: boolean
}

export default function Configuracoes() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { showToast } = useToast()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [testing, setTesting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const [config, setConfig] = useState<ConfiguracaoEmail>({
        smtp_host: '',
        smtp_porta: 587,
        smtp_usuario: '',
        smtp_senha_configurada: false,
        smtp_usar_tls: true,
        smtp_email_remetente: '',
        smtp_nome_remetente: 'ForgeReports',
        smtp_testado_em: null,
        smtp_ultimo_teste_ok: false,
        smtp_configurado: false
    })

    const [senha, setSenha] = useState('')
    const [emailTeste, setEmailTeste] = useState('')

    // Verificar se é admin
    useEffect(() => {
        if (user && user.role !== 'ADMIN') {
            navigate('/dashboard')
            showToast('Apenas administradores podem acessar as configurações.', 'error')
        }
    }, [user, navigate, showToast])

    // Carregar configurações
    useEffect(() => {
        loadConfig()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const loadConfig = async () => {
        try {
            setLoading(true)
            const response = await api.get('/configuracoes/')
            setConfig(response.data)
            setEmailTeste(user?.email || '')
        } catch (error) {
            console.error('Erro ao carregar configurações:', error)
            showToast('Não foi possível carregar as configurações.', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)

            const payload: Record<string, unknown> = {
                smtp_host: config.smtp_host,
                smtp_porta: config.smtp_porta,
                smtp_usuario: config.smtp_usuario,
                smtp_usar_tls: config.smtp_usar_tls,
                smtp_email_remetente: config.smtp_email_remetente,
                smtp_nome_remetente: config.smtp_nome_remetente,
            }

            // Só enviar senha se foi preenchida
            if (senha) {
                payload.smtp_senha = senha
            }

            await api.post('/configuracoes/', payload)

            showToast('As configurações de email foram atualizadas com sucesso.', 'success')

            // Recarregar para atualizar smtp_configurado
            await loadConfig()
            setSenha('')

        } catch (error: unknown) {
            console.error('Erro ao salvar:', error)
            const errMsg = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Não foi possível salvar as configurações.'
            showToast(errMsg, 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleTestEmail = async () => {
        if (!emailTeste) {
            showToast('Informe um email para receber o teste.', 'error')
            return
        }

        try {
            setTesting(true)

            const response = await api.post('/configuracoes/testar_email/', {
                email_destino: emailTeste
            })

            showToast(response.data.message, 'success')

            // Recarregar para atualizar status do teste
            await loadConfig()

        } catch (error: unknown) {
            console.error('Erro ao testar email:', error)
            const errMsg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Não foi possível enviar o email de teste.'
            showToast(errMsg, 'error')
            // Recarregar mesmo em caso de erro para ver status atualizado
            await loadConfig()
        } finally {
            setTesting(false)
        }
    }

    if (loading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                </div>
            </AppLayout>
        )
    }

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Voltar</span>
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-2xl border border-purple-500/30">
                            <Settings className="w-8 h-8 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Configurações</h1>
                            <p className="text-slate-400">Gerencie as configurações da sua empresa</p>
                        </div>
                    </div>
                </div>

                {/* Card de Email */}
                <div className="forge-glass rounded-3xl border border-white/10 overflow-hidden">
                    {/* Header do Card */}
                    <div className="px-6 py-5 border-b border-white/5 bg-gradient-to-r from-purple-500/10 to-transparent">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-xl">
                                <Mail className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Configuração de Email (SMTP)</h2>
                                <p className="text-sm text-slate-400">Configure o servidor de email para envio de relatórios</p>
                            </div>

                            {/* Status Badge */}
                            <div className="ml-auto">
                                {config.smtp_configurado ? (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        <span className="text-sm font-medium text-emerald-400">Configurado</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full">
                                        <XCircle className="w-4 h-4 text-amber-400" />
                                        <span className="text-sm font-medium text-amber-400">Não configurado</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="p-6 space-y-6">
                        {/* Servidor e Porta */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <Server className="w-4 h-4 inline mr-2" />
                                    Servidor SMTP
                                </label>
                                <input
                                    type="text"
                                    value={config.smtp_host}
                                    onChange={(e) => setConfig({ ...config, smtp_host: e.target.value })}
                                    placeholder="smtp.gmail.com"
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Porta
                                </label>
                                <input
                                    type="number"
                                    value={config.smtp_porta}
                                    onChange={(e) => setConfig({ ...config, smtp_porta: parseInt(e.target.value) || 587 })}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* Usuário e Senha */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <Mail className="w-4 h-4 inline mr-2" />
                                    Usuário/Email
                                </label>
                                <input
                                    type="email"
                                    value={config.smtp_usuario}
                                    onChange={(e) => setConfig({ ...config, smtp_usuario: e.target.value })}
                                    placeholder="seu@email.com"
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <Lock className="w-4 h-4 inline mr-2" />
                                    Senha
                                    {config.smtp_senha_configurada && (
                                        <span className="ml-2 text-xs text-emerald-400">(já configurada)</span>
                                    )}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={senha}
                                        onChange={(e) => setSenha(e.target.value)}
                                        placeholder={config.smtp_senha_configurada ? '••••••••' : 'Sua senha ou app password'}
                                        className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Email Remetente e Nome */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Email Remetente (opcional)
                                </label>
                                <input
                                    type="email"
                                    value={config.smtp_email_remetente}
                                    onChange={(e) => setConfig({ ...config, smtp_email_remetente: e.target.value })}
                                    placeholder="Usar mesmo do usuário"
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Nome do Remetente
                                </label>
                                <input
                                    type="text"
                                    value={config.smtp_nome_remetente}
                                    onChange={(e) => setConfig({ ...config, smtp_nome_remetente: e.target.value })}
                                    placeholder="ForgeReports"
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* TLS Toggle */}
                        <div className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-xl border border-white/5">
                            <Shield className="w-5 h-5 text-purple-400" />
                            <div className="flex-1">
                                <span className="text-sm font-medium text-white">Usar TLS (recomendado)</span>
                                <p className="text-xs text-slate-500">Criptografa a conexão com o servidor de email</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setConfig({ ...config, smtp_usar_tls: !config.smtp_usar_tls })}
                                className={`
                  relative w-12 h-7 rounded-full transition-colors duration-300
                  ${config.smtp_usar_tls ? 'bg-purple-500' : 'bg-slate-600'}
                `}
                            >
                                <div className={`
                  absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300
                  ${config.smtp_usar_tls ? 'translate-x-6' : 'translate-x-1'}
                `} />
                            </button>
                        </div>

                        {/* Último teste */}
                        {config.smtp_testado_em && (
                            <div className={`flex items-center gap-3 p-4 rounded-xl border ${config.smtp_ultimo_teste_ok
                                ? 'bg-emerald-500/10 border-emerald-500/30'
                                : 'bg-red-500/10 border-red-500/30'
                                }`}>
                                {config.smtp_ultimo_teste_ok ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-400" />
                                )}
                                <div>
                                    <span className={`text-sm font-medium ${config.smtp_ultimo_teste_ok ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {config.smtp_ultimo_teste_ok ? 'Último teste: sucesso' : 'Último teste: falhou'}
                                    </span>
                                    <p className="text-xs text-slate-500">
                                        {new Date(config.smtp_testado_em).toLocaleString('pt-BR')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Botão Salvar */}
                        <div className="flex justify-end">
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/25"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    'Salvar Configurações'
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Testar Email */}
                    {config.smtp_configurado && (
                        <div className="px-6 py-5 border-t border-white/5 bg-slate-800/30">
                            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                <Send className="w-4 h-4 text-purple-400" />
                                Testar Configuração
                            </h3>
                            <div className="flex gap-3">
                                <input
                                    type="email"
                                    value={emailTeste}
                                    onChange={(e) => setEmailTeste(e.target.value)}
                                    placeholder="Email para receber o teste"
                                    className="flex-1 px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all outline-none"
                                />
                                <Button
                                    onClick={handleTestEmail}
                                    disabled={testing}
                                    variant="outline"
                                    className="px-6 py-3 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 rounded-xl transition-all"
                                >
                                    {testing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Enviar Teste
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info sobre Gmail */}
                <div className="mt-6 p-4 bg-slate-800/30 rounded-2xl border border-white/5">
                    <h4 className="text-sm font-semibold text-white mb-2">💡 Dica para Gmail</h4>
                    <p className="text-sm text-slate-400">
                        Para usar Gmail, ative a <strong>Verificação em duas etapas</strong> e crie uma{' '}
                        <strong>Senha de App</strong> em{' '}
                        <a
                            href="https://myaccount.google.com/apppasswords"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:underline"
                        >
                            myaccount.google.com/apppasswords
                        </a>
                    </p>
                </div>
            </div>
        </AppLayout>
    )
}
