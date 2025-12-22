import { BarChart3, TrendingUp, Users, Activity, Bell, Search, Menu, Zap, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { ForgeLogo } from '../components/layout/ForgeLogo';

export default function MobileMockup() {
    return (
        <div className="w-full min-h-screen bg-slate-950 text-white font-sans overflow-hidden selection:bg-purple-500/30">
            {/* Status Bar */}
            <div className="flex justify-between items-center px-6 py-4 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
                <span className="text-xs font-bold tracking-widest text-slate-500">9:41</span>
                <div className="flex gap-1.5">
                    <div className="w-4 h-1.5 rounded-full bg-slate-700" />
                    <div className="w-4 h-1.5 rounded-full bg-slate-700" />
                    <div className="w-4 h-1.5 rounded-full bg-white" />
                </div>
            </div>

            {/* Header */}
            <div className="px-6 py-4 flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <Zap className="w-4 h-4 text-white fill-current" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold leading-none">Forge<span className="text-primary-400">AI</span></h1>
                        <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Enterprise</span>
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute top-0 right-0 w-2 h-2 bg-accent-500 rounded-full border-2 border-slate-950"></div>
                    <Bell className="w-6 h-6 text-slate-400" />
                </div>
            </div>

            {/* Main Content */}
            <div className="px-5 space-y-6">

                {/* Hero Card */}
                <div className="relative p-6 rounded-[2rem] bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 border border-white/10 shadow-2xl shadow-purple-900/20 overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-bold tracking-wider uppercase mb-4 text-purple-200">
                        Real-time Insights
                    </span>

                    <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-3xl font-bold">R$ 1.2M</span>
                        <span className="text-sm text-purple-200 font-medium">/ mês</span>
                    </div>
                    <p className="text-xs text-purple-300 mb-6">Receita Total Recorrente</p>

                    <div className="h-16 flex items-end gap-1.5 mb-2">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95].map((h, i) => (
                            <div key={i} className="flex-1 bg-white/20 rounded-t-sm hover:bg-accent-400 transition-colors cursor-pointer group relative" style={{ height: `${h}%` }}>
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {h}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { icon: BarChart3, label: "Stats", color: "text-blue-400", bg: "bg-blue-400/10" },
                        { icon: Users, label: "Teams", color: "text-orange-400", bg: "bg-orange-400/10" },
                        { icon: Wallet, label: "Sales", color: "text-green-400", bg: "bg-green-400/10" },
                        { icon: Activity, label: "Live", color: "text-pink-400", bg: "bg-pink-400/10" },
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center hover:scale-105 transition-transform cursor-pointer`}>
                                <item.icon className={`w-6 h-6 ${item.color}`} />
                            </div>
                            <span className="text-[10px] font-medium text-slate-400">{item.label}</span>
                        </div>
                    ))}
                </div>

                {/* Section Header */}
                <div className="flex justify-between items-end">
                    <h2 className="text-lg font-bold">Relatórios Ativos</h2>
                    <button className="text-xs font-semibold text-primary-400">Ver todos</button>
                </div>

                {/* Stacked Cards */}
                <div className="space-y-4">
                    {[
                        { title: "Vendas Q4 - 2025", desc: "Análise preditiva de fim de ano", icon: TrendingUp, trend: "+12.5%", trendColor: "text-green-400" },
                        { title: "Churn Rate", desc: "Monitoramento de cancelamentos", icon: Users, trend: "-2.1%", trendColor: "text-green-400" },
                        { title: "Performance de Servidores", desc: "Latência e uptime global", icon: Activity, trend: "+0.4s", trendColor: "text-red-400" },
                    ].map((card, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 border border-white/5 hover:border-primary-500/30 transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                                <card.icon className="w-5 h-5 text-slate-300" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-slate-100">{card.title}</h3>
                                <p className="text-[10px] text-slate-500">{card.desc}</p>
                            </div>
                            <div className={`px-2.5 py-1 rounded-lg bg-slate-950 border border-white/5 text-xs font-bold ${card.trendColor}`}>
                                {card.trend}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Floating Action Button */}
                <div className="fixed bottom-6 right-6">
                    <button className="w-14 h-14 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-slate-950 flex items-center justify-center shadow-lg shadow-primary-500/30 hover:scale-110 active:scale-95 transition-all">
                        <Zap className="w-6 h-6 fill-current" />
                    </button>
                </div>
            </div>

            {/* Bottom Nav Mockup */}
            <div className="fixed bottom-0 w-full h-16 bg-slate-950/90 backdrop-blur-xl border-t border-white/5 flex justify-around items-center px-2 z-40">
                <Menu className="w-6 h-6 text-slate-500" />
                <Search className="w-6 h-6 text-slate-500" />
                <div className="w-8" /> {/* Spacer for FAB */}
                <Activity className="w-6 h-6 text-primary-500" />
                <div className="w-6 h-6 rounded-full bg-slate-700 ring-2 ring-slate-800" />
            </div>

        </div>
    );
}
