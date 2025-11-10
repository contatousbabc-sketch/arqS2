
import React from "react";
import { Link } from "react-router-dom";
import { BrainCircuit, Calendar, Target, Activity, AlertTriangle } from "lucide-react";
import { Match, Player } from "../types";

interface DashboardProps {
  matches: Match[];
  players: Player[];
}

const StatsCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; color: string }> = ({ title, value, icon: Icon, color }) => {
  const colors: { [key: string]: string } = {
    green: 'from-green-500/10 to-green-600/5 border-green-500/20 text-green-400',
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-400',
    yellow: 'from-yellow-500/10 to-yellow-600/5 border-yellow-500/20 text-yellow-400',
    red: 'from-red-500/10 to-red-600/5 border-red-500/20 text-red-400',
  };

  return (
    <div className={`bg-black/30 backdrop-blur-sm ${colors[color]} border rounded-xl p-6 shadow-lg`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-400 mb-2">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`p-2 rounded-lg bg-gray-700/50 ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ matches, players }) => {
  
  const nextMatches = matches.filter(m => 
    new Date(m.match_date) > new Date()
  ).slice(0, 3);

  const analyzedMatches = matches.filter(m => m.status === 'Análise Concluída');
  const injuredPlayers = players.filter(p => p.status === 'Lesionado').length;
  const suspendedPlayers = players.filter(p => p.status === 'Suspenso').length;

  const avgConfidence = analyzedMatches.length > 0
    ? analyzedMatches.reduce((sum, m) => sum + (m.prediction?.confidence_score || 0), 0) / analyzedMatches.length
    : 0;

  return (
    <div className="min-h-full bg-corinthians-dark p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-corinthians-gold bg-clip-text text-transparent mb-2">
              Dashboard de Análise
            </h1>
            <p className="text-gray-400">Visão geral do sistema de previsão inteligente.</p>
          </div>
          <Link to="/nova-analise" className="mt-4 sm:mt-0">
            <button className="bg-gradient-to-r from-corinthians-gold to-yellow-600 hover:to-yellow-500 text-black font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition-transform duration-200 hover:scale-105">
              <BrainCircuit className="w-5 h-5" />
              Nova Análise
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Confiança Média"
            value={`${(avgConfidence * 100).toFixed(0)}%`}
            icon={Target}
            color="green"
          />
          <StatsCard
            title="Análises Realizadas"
            value={analyzedMatches.length}
            icon={Activity}
            color="blue"
          />
          <StatsCard
            title="Próximas Partidas"
            value={matches.filter(m => new Date(m.match_date) > new Date()).length}
            icon={Calendar}
            color="yellow"
          />
          <StatsCard
            title="Desfalques"
            value={injuredPlayers + suspendedPlayers}
            icon={AlertTriangle}
            color="red"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-black/50 border border-corinthians-gray rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Próximas Partidas</h3>
            {nextMatches.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Nenhuma partida futura encontrada.</p>
            ) : (
              <div className="space-y-4">
                {nextMatches.map(match => (
                  <div key={match.id} className="p-4 bg-corinthians-gray/50 rounded-lg border border-transparent hover:border-corinthians-gold/50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-semibold">
                          Corinthians vs {match.opponent}
                        </p>
                        <p className="text-sm text-gray-400">
                          {new Date(match.match_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <span className="text-corinthians-gold text-sm font-semibold">{match.competition}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-black/50 border border-corinthians-gray rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Análises Recentes</h3>
             {analyzedMatches.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nenhuma análise foi concluída ainda.</p>
             ) : (
                <div className="space-y-4">
                {analyzedMatches.slice(0,3).map(match => (
                    <div key={match.id} className="p-4 bg-corinthians-gray/50 rounded-lg border border-transparent hover:border-corinthians-gold/50 transition-colors">
                        <div className="flex justify-between items-center">
                          <p className="text-white font-semibold">Corinthians vs {match.opponent}</p>
                          <p className="text-sm font-bold text-corinthians-gold">
                            {match.prediction?.expected_goals_corinthians.toFixed(0)} x {match.prediction?.expected_goals_opponent.toFixed(0)}
                          </p>
                        </div>
                        <p className="text-sm text-green-400 mt-1">
                          Previsão: {match.prediction?.winner} ({(match.prediction?.confidence_score ?? 0 * 100).toFixed(0)}% de confiança)
                        </p>
                    </div>
                ))}
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
