
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Calendar, CheckCircle, Clock, XCircle, Trash2, BrainCircuit, Eye } from "lucide-react";
import { Match } from "../types";

interface MatchesProps {
  matches: Match[];
  deleteMatch: (matchId: string) => void;
}

const statusConfig = {
    'Agendada': { color: 'text-blue-400', icon: Clock },
    'Em Análise': { color: 'text-yellow-400', icon: BrainCircuit },
    'Análise Concluída': { color: 'text-green-400', icon: CheckCircle },
    'Erro': { color: 'text-red-400', icon: XCircle }
};

const Matches: React.FC<MatchesProps> = ({ matches, deleteMatch }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredMatches = matches.filter(m => 
        m.opponent.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.competition.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-full bg-corinthians-dark p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-corinthians-gold bg-clip-text text-transparent mb-2">
                            Partidas
                        </h1>
                        <p className="text-gray-400">Histórico de todas as partidas e análises.</p>
                    </div>
                    <div className="relative mt-4 sm:mt-0 w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por adversário..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-corinthians-gray/50 border border-corinthians-gray text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-corinthians-gold"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {filteredMatches.length === 0 ? (
                        <div className="text-center py-20 bg-black/50 border border-corinthians-gray rounded-xl">
                            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg mb-4">Nenhuma partida encontrada.</p>
                            <Link to="/nova-analise">
                                <button className="bg-corinthians-gold text-black font-semibold px-6 py-2 rounded-lg">
                                    Criar Nova Análise
                                </button>
                            </Link>
                        </div>
                    ) : (
                        filteredMatches.map(match => {
                            const StatusIcon = statusConfig[match.status].icon;
                            const statusColor = statusConfig[match.status].color;
                            return (
                                <div key={match.id} className="bg-black/50 border border-corinthians-gray rounded-xl p-6 transition-colors">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-2">
                                                <h3 className="text-xl font-bold text-white">
                                                    Corinthians vs {match.opponent}
                                                </h3>
                                                <span className="text-corinthians-gold font-semibold text-sm">{match.competition}</span>
                                            </div>
                                            <p className="text-sm text-gray-400">
                                                {new Date(match.match_date).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}
                                            </p>
                                             <p className={`flex items-center gap-2 mt-3 text-sm font-semibold ${statusColor}`}>
                                                <StatusIcon className="w-4 h-4" />
                                                <span>{match.status}</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            {match.prediction && (
                                                <div className="text-right flex-grow">
                                                    <p className="font-bold text-lg text-white">Previsão: {match.prediction.winner}</p>
                                                    <p className="text-sm text-gray-300">
                                                        Placar: {Math.round(match.prediction.expected_goals_corinthians)} x {Math.round(match.prediction.expected_goals_opponent)}
                                                        <span className="ml-2 text-green-400 font-semibold">({(match.prediction.confidence_score*100).toFixed(0)}% conf.)</span>
                                                    </p>
                                                </div>
                                            )}
                                             {match.status === 'Análise Concluída' && (
                                                <Link to={`/partidas/${match.id}`} className="bg-corinthians-gray hover:bg-corinthians-gold hover:text-black text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm whitespace-nowrap">
                                                    <Eye className="w-4 h-4"/>
                                                    Ver Dossiê
                                                </Link>
                                            )}
                                            <button 
                                                onClick={() => {
                                                    if (window.confirm(`Tem certeza que deseja excluir a partida contra ${match.opponent}?`)) {
                                                        deleteMatch(match.id);
                                                    }
                                                }}
                                                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                                                aria-label="Excluir partida"
                                            >
                                                <Trash2 className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </div>
                                    {match.status === 'Erro' && (
                                        <div className="mt-4 p-3 bg-red-900/50 border border-red-500/30 rounded-lg text-red-300 text-sm">
                                            <strong>Erro na análise:</strong> {match.error}
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default Matches;