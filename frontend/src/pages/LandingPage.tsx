import { useNavigate } from 'react-router-dom';
import {
    BarChart3,
    Shield,
    Zap,
    Database,
    Clock,
    Users,
    ChevronRight,
    Check,
    Mail
} from 'lucide-react';
import { ForgeLogo } from '../components/layout/ForgeLogo';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-primary-500/30">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <ForgeLogo size={40} />

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
                        <a href="#features" className="hover:text-primary-400 transition-colors">Funcionalidades</a>
                        <a href="#pricing" className="hover:text-primary-400 transition-colors">Preços</a>
                        <a href="#about" className="hover:text-primary-400 transition-colors">Sobre</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm font-medium hover:text-primary-400 transition-colors"
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => navigate('/cadastro')}
                            className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-lg shadow-primary-500/20 active:scale-95"
                        >
                            Criar Conta
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-24 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary-500/10 rounded-full blur-[120px]" />
                    <div className="absolute top-40 left-1/3 w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-[100px]" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold tracking-wider uppercase mb-8 animate-fade-in">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                            </span>
                            Nova versão 2.0 disponível
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                            Forje Seus Dados em <span className="text-primary-400">Relatórios</span> Poderosos
                        </h1>

                        <p className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
                            A plataforma definitiva para automatizar, organizar e visualizar dados complexos.
                            Transforme caos em clareza com o CForgeReports.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => navigate('/cadastro')}
                                className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-500 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 group shadow-xl shadow-primary-500/20 active:scale-95"
                            >
                                Começar Agora
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                                className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-lg transition-all active:scale-95"
                            >
                                Ver Demonstração
                            </button>
                        </div>
                    </div>

                    <div className="mt-32 relative max-w-6xl mx-auto group perspective-2000">
                        {/* Background Glow behind the mockup */}
                        <div className="absolute -inset-20 bg-primary-600/10 rounded-full blur-[120px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

                        <div className="relative flex items-center justify-center pt-20 pb-40">
                            {/* Desktop Mockup - The Base Layer */}
                            <div
                                className="relative z-10 w-full max-w-4xl aspect-[16/10] bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] transition-all duration-700 ease-out group-hover:shadow-primary-500/10 group-hover:border-white/20"
                                style={{
                                    transform: 'rotateY(-15deg) rotateX(10deg) rotateZ(-2deg)',
                                    transformStyle: 'preserve-3d'
                                }}
                            >
                                <div className="bg-slate-800/80 px-4 py-3 flex items-center gap-2 border-b border-white/10 backdrop-blur-md">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                                    </div>
                                    <div className="mx-auto text-[10px] text-slate-500 font-mono tracking-wider opacity-60 uppercase">forge-dashboard-v2.exe</div>
                                </div>
                                <div className="relative w-full h-full bg-slate-950">
                                    <img
                                        src="/images/dashboard-desktop.png"
                                        alt="ForgeReports Desktop Dashboard"
                                        className="w-full h-full object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity"
                                    />
                                    {/* Subtle light reflection on the screen */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"></div>
                                </div>
                            </div>

                            {/* Mobile Mockup - The Floating Layer */}
                            <div
                                className="absolute right-[5%] bottom-[10%] z-20 w-[160px] md:w-[220px] aspect-[9/19] bg-slate-900 border-[8px] border-slate-800 rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] transition-all duration-700 ease-out group-hover:translate-x-4 group-hover:-translate-y-4"
                                style={{
                                    transform: 'rotateY(10deg) rotateX(5deg) rotateZ(5deg) translateZ(50px)',
                                    transformStyle: 'preserve-3d'
                                }}
                            >
                                {/* Smartphone Notch */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-800 rounded-b-2xl z-30 flex items-center justify-center">
                                    <div className="w-8 h-1 bg-slate-700 rounded-full"></div>
                                </div>

                                <img
                                    src="/images/dashboard-mobile-future.png"
                                    alt="ForgeReports Mobile UI Concept"
                                    className="w-full h-full object-cover"
                                />

                                {/* Screen Glow */}
                                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[2.2rem] pointer-events-none"></div>
                            </div>

                            {/* Decorative Floating Elements (Data Sparks) */}
                            <div className="absolute top-1/4 -left-10 w-20 h-20 bg-primary-500/20 blur-3xl animate-pulse"></div>
                            <div className="absolute bottom-1/4 -right-20 w-32 h-32 bg-accent-500/10 blur-3xl animate-pulse delay-700"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-slate-950 relative">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-primary-500 text-sm font-bold tracking-widest uppercase mb-4">Funcionalidades</h2>
                        <h3 className="text-3xl md:text-5xl font-bold mb-6">Tudo o que você precisa para dominar seus dados</h3>
                        <p className="text-slate-400 text-lg">
                            Construído para profissionais que buscam velocidade, segurança e insights precisos em tempo real.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <BarChart3 className="w-8 h-8 text-primary-400" />,
                                title: "Vários Bancos de Dados",
                                description: "Conecte-se a SQL Server, PostgreSQL, MySQL e muito mais em segundos."
                            },
                            {
                                icon: <Shield className="w-8 h-8 text-accent-400" />,
                                title: "Segurança Avançada",
                                description: "Seus dados são protegidos com criptografia de ponta e controle de acesso granular."
                            },
                            {
                                icon: <Zap className="w-8 h-8 text-yellow-500" />,
                                title: "Performance Extrema",
                                description: "Execução otimizada de queries para entregar resultados instantâneos."
                            },
                            {
                                icon: <Database className="w-8 h-8 text-blue-500" />,
                                title: "Histórico Completo",
                                description: "Rastreie cada execução e mantenha um histórico detalhado de todas as consultas."
                            },
                            {
                                icon: <Users className="w-8 h-8 text-purple-400" />,
                                title: "Colaboração em Equipe",
                                description: "Trabalhe em conjunto com outros usuários e compartilhe relatórios facilmente."
                            },
                            {
                                icon: <Clock className="w-8 h-8 text-green-400" />,
                                title: "Agendamentos",
                                description: "Automatize a geração de relatórios e receba-os diretamente no seu e-mail."
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="group p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] hover:border-white/20 transition-all">
                                <div className="mb-6 p-3 bg-slate-900 rounded-xl inline-block group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h4 className="text-xl font-bold mb-4">{feature.title}</h4>
                                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 bg-slate-900/50">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-primary-500 text-sm font-bold tracking-widest uppercase mb-4">Planos e Preços</h2>
                        <h3 className="text-3xl md:text-5xl font-bold mb-6">Escolha o plano ideal para sua escala</h3>
                        <p className="text-slate-400 text-lg">
                            De projetos pessoais a grandes infraestruturas corporativas.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[
                            {
                                name: "Gratuito",
                                price: "0",
                                features: ["Até 5 relatórios", "1 conexão ativa", "Histórico de 7 dias", "Suporte via comunidade"],
                                cta: "Começar Grátis",
                                popular: false
                            },
                            {
                                name: "Profissional",
                                price: "99",
                                features: ["Relatórios ilimitados", "Conexões ilimitadas", "Histórico ilimitado", "Agendamento de relatórios", "Suporte prioritário"],
                                cta: "Assinar Agora",
                                popular: true
                            },
                            {
                                name: "Enterprise",
                                price: "Custom",
                                features: ["SSO & SAML", "Instalação on-premise", "SLA garantido", "Gerente de conta dedicado", "Treinamento especializado"],
                                cta: "Falar com Vendas",
                                popular: false
                            }
                        ].map((plan, idx) => (
                            <div key={idx} className={`relative p-8 rounded-3xl border ${plan.popular ? 'bg-slate-950 border-primary-500 shadow-2xl shadow-primary-500/10' : 'bg-white/5 border-white/10'}`}>
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-600 text-white text-xs font-bold rounded-full uppercase tracking-widest">
                                        Mais Popular
                                    </div>
                                )}
                                <div className="mb-8">
                                    <h4 className="text-xl font-bold mb-2">{plan.name}</h4>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold">{plan.price !== 'Custom' ? `R$${plan.price}` : plan.price}</span>
                                        {plan.price !== 'Custom' && <span className="text-slate-500 text-sm">/mês</span>}
                                    </div>
                                </div>
                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, fIdx) => (
                                        <li key={fIdx} className="flex items-center gap-3 text-slate-300 text-sm">
                                            <Check className="w-5 h-5 text-accent-500 shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    className={`w-full py-4 rounded-xl font-bold transition-all active:scale-95 ${plan.popular
                                        ? 'bg-primary-600 hover:bg-primary-500 text-white'
                                        : 'bg-white/10 hover:bg-white/20 text-white'
                                        }`}
                                >
                                    {plan.cta}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary-600 opacity-10 blur-[100px]" />
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-900 to-slate-950 p-12 md:p-20 rounded-[40px] border border-white/10 shadow-3xl">
                        <h3 className="text-3xl md:text-5xl font-bold mb-8">Pronto para transformar sua gestão de dados?</h3>
                        <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto">
                            Junte-se a centenas de empresas que já otimizaram seus processos com o ForgeReports.
                        </p>
                        <button
                            onClick={() => navigate('/cadastro')}
                            className="bg-white text-slate-950 hover:bg-slate-200 px-10 py-5 rounded-2xl font-bold text-xl transition-all shadow-xl shadow-white/10 active:scale-95"
                        >
                            Criar minha conta agora
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-white/5 bg-slate-950">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-1">
                            <ForgeLogo size={32} className="mb-6" />
                            <p className="text-slate-500 text-sm leading-relaxed">
                                A ferramenta definitiva para profissionais de dados que buscam excelência e velocidade.
                            </p>
                        </div>
                        <div>
                            <h5 className="font-bold mb-6">Produto</h5>
                            <ul className="space-y-4 text-sm text-slate-400">
                                <li><a href="#" className="hover:text-primary-400">Funcionalidades</a></li>
                                <li><a href="#" className="hover:text-primary-400">Integrações</a></li>
                                <li><a href="#" className="hover:text-primary-400">Preços</a></li>
                                <li><a href="#" className="hover:text-primary-400">Changelog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-bold mb-6">Suporte</h5>
                            <ul className="space-y-4 text-sm text-slate-400">
                                <li><a href="#" className="hover:text-primary-400">Documentação</a></li>
                                <li><a href="#" className="hover:text-primary-400">API</a></li>
                                <li><a href="#" className="hover:text-primary-400">Status</a></li>
                                <li><a href="#" className="hover:text-primary-400">Contato</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-bold mb-6">Newsletter</h5>
                            <p className="text-sm text-slate-400 mb-4">Receba atualizações sobre novos recursos.</p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Seu e-mail"
                                    className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-primary-500 flex-1"
                                />
                                <button className="bg-primary-600 p-2 rounded-lg hover:bg-primary-500 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
                        <p>© 2024 ForgeReports. Todos os direitos reservados.</p>
                        <div className="flex gap-8">
                            <a href="#" className="hover:text-slate-400">Termos de Uso</a>
                            <a href="#" className="hover:text-slate-400">Privacidade</a>
                            <a href="#" className="hover:text-slate-400">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
