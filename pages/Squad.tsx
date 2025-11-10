
import React, { useState } from "react";
import { Users, Search, ShieldCheck, ShieldAlert, ShieldX, Star, HelpCircle } from "lucide-react";
import { Player } from "../types";

interface SquadProps {
  players: Player[];
}

const statusConfig: { [key: string]: { color: string; icon: React.ElementType; bg: string } } = {
    'Disponível': { color: 'text-green-400', icon: ShieldCheck, bg: 'bg-green-500/10' },
    'Lesionado': { color: 'text-red-400', icon: ShieldAlert, bg: 'bg-red-500/10' },
    'Suspenso': { color: 'text-yellow-400', icon: ShieldX, bg: 'bg-yellow-500/10' },
    'Dúvida': { color: 'text-orange-400', icon: HelpCircle, bg: 'bg-orange-500/10' },
};

const positions = ['Goleiro', 'Zagueiro', 'Lateral', 'Meio-Campo', 'Atacante'];

const Squad: React.FC<SquadProps> = ({ players }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPosition, setSelectedPosition] = useState('all');

    const filteredPlayers = players.sort((a,b) => (a.shirt_number || 999) - (b.shirt_number || 999)).filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPosition = selectedPosition === 'all' || p.position === selectedPosition;
        return matchesSearch && matchesPosition;
    });

    return (
        <div className="min-h-full bg-corinthians-dark p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-corinthians-gold bg-clip-text text-transparent mb-2">
                        Elenco
                    </h1>
                    <p className="text-gray-400">Jogadores do Corinthians e seu status, atualizados via IA.</p>
                </div>

                <div className="bg-black/50 border border-corinthians-gray rounded-xl p-4 mb-8 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar jogador..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-corinthians-gray/50 border border-corinthians-gray text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-corinthians-gold"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                        <button onClick={() => setSelectedPosition('all')} className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${selectedPosition === 'all' ? 'bg-corinthians-gold text-black' : 'bg-corinthians-gray text-gray-300 hover:bg-corinthians-gray/70'}`}>Todos</button>
                        {positions.map(pos => (
                             <button key={pos} onClick={() => setSelectedPosition(pos)} className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${selectedPosition === pos ? 'bg-corinthians-gold text-black' : 'bg-corinthians-gray text-gray-300 hover:bg-corinthians-gray/70'}`}>{pos}</button>
                        ))}
                    </div>
                </div>

                {filteredPlayers.length === 0 ? (
                    <div className="text-center py-20 bg-black/50 border border-corinthians-gray rounded-xl">
                        <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">Nenhum jogador encontrado.</p>
                        {players.length === 0 && <p className="text-sm text-gray-500 mt-2">Execute uma análise para popular o elenco automaticamente.</p>}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredPlayers.map((player) => {
                            const playerStatusKey = player.status as keyof typeof statusConfig;
                            const { icon: StatusIcon, color: statusColor, bg: statusBg } = statusConfig[playerStatusKey] || { icon: ShieldCheck, color: 'text-gray-400', bg: 'bg-gray-700/20' };
                            const stats = player.performance_stats;
                            
                            return (
                                <div key={player.name} className="bg-black/50 border border-corinthians-gray rounded-xl p-5 flex flex-col justify-between hover:border-corinthians-gold/50 transition-all duration-300 hover:scale-105 shadow-lg">
                                    <div>
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-corinthians-gray rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 border-2 border-corinthians-gray/50">
                                                    {player.shirt_number || '?'}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-white leading-tight">{player.name}</h3>
                                                    <p className="text-sm text-gray-400">{player.position} / {player.age || 'N/A'} anos</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className={`mb-4 p-3 rounded-lg flex items-start gap-3 font-semibold ${statusColor} ${statusBg}`}>
                                            <StatusIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p>{player.status}</p>
                                                {(player.status === 'Lesionado' || player.status === 'Dúvida') && player.injury_details && 
                                                    <p className="text-xs font-normal text-gray-400 mt-1">{player.injury_details}</p>}
                                            </div>
                                        </div>

                                        {stats && Object.keys(stats).length > 0 && (
                                            <div className="border-t border-corinthians-gray/50 pt-4">
                                                <h4 className="text-sm font-semibold text-gray-400 mb-2">Desempenho Recente</h4>
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                                    <div className="text-gray-300">Jogos: <span className="font-bold text-white">{stats.games_played ?? '-'}</span></div>
                                                    <div className="text-gray-300">Gols: <span className="font-bold text-white">{stats.goals ?? '-'}</span></div>
                                                    <div className="text-gray-300">Assist.: <span className="font-bold text-white">{stats.assists ?? '-'}</span></div>
                                                    <div className="text-gray-300 flex items-center gap-1">Nota: 
                                                        <span className="font-bold text-white flex items-center gap-1">
                                                            {stats.rating_average?.toFixed(1) ?? '-'} 
                                                            {stats.rating_average && <Star className="w-3 h-3 text-yellow-500"/>}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Squad;
