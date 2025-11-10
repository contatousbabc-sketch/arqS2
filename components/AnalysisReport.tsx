import React, { useState } from 'react';
import { Match } from '../types';
import { ArrowLeft, ListChecks, AlertTriangle, Shield, UserCheck, Users, Newspaper, Swords, Brain, Wand2, FileText, BarChart, Trello, LineChart, Info, Zap, BarChart2, Map, HeartPulse } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AnalysisReportProps {
  match: Match;
  onBack: () => void;
  addOrUpdateMatch: (match: Match) => void;
}

const InfoCard: React.FC<{ icon: React.ElementType; title: string; children: React.ReactNode; className?: string }> = ({ icon: Icon, title, children, className = '' }) => (
  <div className={`bg-corinthians-gray/30 rounded-lg p-6 border border-corinthians-gray/50 ${className}`}>
    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
      <Icon className="text-corinthians-gold w-6 h-6" />
      {title}
    </h3>
    {children}
  </div>
);

const TeamDataCard: React.FC<{ title: string, team: any }> = ({ title, team }) => (
    <div className="bg-corinthians-gray/30 rounded-lg p-6 border border-corinthians-gray/50">
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        <div className="space-y-3 text-sm">
            <p><strong className="text-gray-300">Forma Recente:</strong> <span className="font-mono text-white">{team.recent_form}</span></p>
            <p><strong className="text-gray-300">Estilo:</strong> <span className="text-white">{team.playing_style}</span></p>
             <p><strong className="text-gray-300">Motivação:</strong> <span className="text-white italic">{team.team_motivation}</span></p>
            <p><strong className="text-gray-300">Gols Marcados (média):</strong> <span className="text-green-400 font-bold">{team.avg_goals_scored?.toFixed(1)}</span></p>
            <p><strong className="text-gray-300">Gols Sofridos (média):</strong> <span className="text-red-400 font-bold">{team.avg_goals_conceded?.toFixed(1)}</span></p>
             <p><strong className="text-gray-300">Posse de Bola (média):</strong> <span className="text-blue-400 font-bold">{team.possession_avg?.toFixed(0) ?? 'N/A'}%</span></p>
            <p><strong className="text-gray-300">Finalizações (média):</strong> <span className="text-yellow-400 font-bold">{team.shots_per_game_avg?.toFixed(1) ?? 'N/A'}</span></p>
            <div>
                <strong className="text-gray-300">Desfalques:</strong>
                <ul className="list-disc list-inside text-white pl-2">
                    {team.injuries_suspensions?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                </ul>
            </div>
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const isPieChart = !label;
      return (
        <div className="bg-corinthians-gray p-3 border border-corinthians-gold/50 rounded-lg shadow-lg text-sm">
          {label && <p className="font-bold text-white mb-2">{label}</p>}
          {payload.map((pld: any, index: number) => {
             const finalColor = isPieChart ? pld.payload.fill : pld.color;
             const value = isPieChart ? `${pld.value}%` : pld.value;
             return (
                 <p key={index} style={{ color: finalColor }}>
                    {`${pld.name}: ${value}`}
                </p>
             )
          })}
        </div>
      );
    }
    return null;
};


const AnalysisReport: React.FC<AnalysisReportProps> = ({ match, onBack, addOrUpdateMatch }) => {
  if (!match.prediction || !match.auto_collected_data) {
    return <div>Erro: Dados da análise não encontrados.</div>;
  }
  
  const [activeTab, setActiveTab] = useState('summary');

  const { prediction, opponent, venue, auto_collected_data } = match;
  const { corinthians_stats, opponent_stats, head_to_head, news_and_context, tactical_analysis, investigative_report } = auto_collected_data;
  
  const probCorinthians = venue === 'Casa' ? prediction.home_win_probability : prediction.away_win_probability;
  const probOpponent = venue === 'Casa' ? prediction.away_win_probability : prediction.home_win_probability;
  
  const tabs = [
    { id: 'summary', label: 'Resumo', icon: FileText },
    { id: 'data', label: 'Dados Coletados', icon: BarChart },
    { id: 'tactical', label: 'Análise Tática', icon: Trello },
    { id: 'stats', label: 'Estatísticas Previstas', icon: BarChart2 },
    { id: 'players', label: 'Jogadores-Chave', icon: Users },
  ];

  const stats = prediction.predicted_stats;
  const barChartData = stats ? [
      { name: 'Finalizações', 'Corinthians': stats.total_shots_corinthians, [opponent]: stats.total_shots_opponent },
      { name: 'Final. no Gol', 'Corinthians': stats.shots_on_goal_corinthians, [opponent]: stats.shots_on_goal_opponent },
      { name: 'Escanteios', 'Corinthians': stats.corners_corinthians, [opponent]: stats.corners_opponent },
      { name: 'Faltas', 'Corinthians': stats.fouls_corinthians, [opponent]: stats.fouls_opponent },
      { name: 'Cartões', 'Corinthians': stats.yellow_cards_corinthians, [opponent]: stats.yellow_cards_opponent },
  ] : [];

  const possessionPieData = stats ? [
      { name: 'Corinthians', value: stats.possession_corinthians },
      { name: opponent, value: stats.possession_opponent }
  ] : [];

  const goalsData = [
    {
        name: 'Gols Esperados',
        'Corinthians': prediction.expected_goals_corinthians.toFixed(2),
        [opponent]: prediction.expected_goals_opponent.toFixed(2),
    },
  ];

  const pieProbData = [
    { name: `Vitória Corinthians`, value: Math.round(probCorinthians * 100) },
    { name: 'Empate', value: Math.round(prediction.draw_probability * 100) },
    { name: `Vitória ${opponent}`, value: Math.round(probOpponent * 100) },
  ];
  const PROB_COLORS = ['#FFFFFF', '#808080', '#D4AF37']; // Corinthians (White), Draw (Gray), Opponent (Gold)
  const PIE_COLORS = ['#FFFFFF', '#D4AF37'];
  
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const textColor = '#101010'; // Black text for both white and gold backgrounds provides good contrast

    return (
        <text x={x} y={y} fill={textColor} textAnchor="middle" dominantBaseline="central" fontWeight="bold" fontSize={16}>
        {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
  };

  const findKeyPlayerAnalysis = (playerName: string, teamName: string): any | undefined => {
      const sourceTeam: any = teamName === 'Corinthians' ? corinthians_stats : opponent_stats;
      return sourceTeam?.key_player_analysis?.find((p: any) => p.player_name === playerName);
  };

  return (
    <div className="min-h-full bg-corinthians-dark p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                <ArrowLeft className="w-5 h-5" /> Voltar
            </button>
        </div>
        
        <div className="bg-black/50 border border-corinthians-gray rounded-xl p-8 mb-6">
            <div className="text-center mb-8">
                <p className="text-corinthians-gold font-semibold">{match.competition} - {new Date(match.match_date).toLocaleDateString('pt-BR')}</p>
                <h2 className="text-4xl font-bold text-white mt-2">Corinthians vs {opponent}</h2>
                <h3 className="text-2xl font-light text-gray-300 mt-2">Dossiê de Inteligência WebSailor V2</h3>
            </div>

            <div className="mb-8 border-b border-corinthians-gray flex justify-center flex-wrap">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 md:px-6 py-3 font-semibold transition-colors ${activeTab === tab.id ? 'text-corinthians-gold border-b-2 border-corinthians-gold' : 'text-gray-400 hover:text-white'}`}
                    >
                        <tab.icon className="w-5 h-5" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="animate-fade-in">
                {activeTab === 'summary' && (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <div className="lg:col-span-2 flex flex-col gap-6">
                             <div className="bg-black/20 p-6 rounded-lg border border-corinthians-gray/50 text-center flex-grow flex flex-col justify-center">
                                <p className="text-sm text-gray-400 mb-2">Placar Final Previsto</p>
                                <p className="text-5xl font-bold text-white tracking-wider">
                                    {Math.round(prediction.expected_goals_corinthians)}
                                    <span className="mx-4 text-gray-500">-</span>
                                    {Math.round(prediction.expected_goals_opponent)}
                                </p>
                            </div>
                            <div className="p-6 rounded-xl bg-corinthians-gold/20 border-2 border-corinthians-gold/30 text-center flex-grow flex flex-col justify-center">
                                <p className="text-sm text-gray-400 mb-1">Vencedor Previsto</p>
                                <p className="text-4xl font-bold text-white">{prediction.winner}</p>
                            </div>
                        </div>
                        <div className="lg:col-span-3">
                             <div className="bg-corinthians-gray/30 rounded-lg p-6 border border-corinthians-gray/50 h-full">
                                <h3 className="text-xl font-bold text-white mb-4 text-center">Probabilidades de Resultado</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie data={pieProbData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
                                            {pieProbData.map((entry, index) => <Cell key={`cell-${index}`} fill={PROB_COLORS[index % PROB_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{fontSize: "14px", marginTop: "10px"}}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <InfoCard icon={LineChart} title="Nível de Confiança" className="lg:col-span-5">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-full bg-corinthians-gray/50 rounded-full h-4">
                                    <div className="bg-corinthians-gold h-4 rounded-full" style={{ width: `${(prediction.confidence_score * 100).toFixed(0)}%` }}></div>
                                </div>
                                <span className="text-xl font-bold text-corinthians-gold">{(prediction.confidence_score * 100).toFixed(0)}%</span>
                            </div>
                             <p className="text-sm text-gray-300 italic">{prediction.confidence_breakdown}</p>
                        </InfoCard>

                        {match.user_provided_context && (
                            <InfoCard icon={Info} title="Diretivas do Operador" className="lg:col-span-5">
                                <p className="text-gray-300 italic whitespace-pre-wrap">{match.user_provided_context}</p>
                                <p className="text-xs text-blue-300 mt-3">* Esta informação foi usada para corrigir e validar a análise da IA.</p>
                            </InfoCard>
                        )}
                        
                        {investigative_report && (
                            <InfoCard icon={Zap} title="Relatório Investigativo (Deep Dive)" className="lg:col-span-5">
                                <p className="text-gray-300 italic mb-4">{investigative_report.summary}</p>
                                {investigative_report.high_impact_findings.length > 0 && (
                                     <div>
                                        <h4 className="font-semibold text-white mb-2">Descobertas de Alto Impacto:</h4>
                                        <ul className="space-y-2 list-disc list-inside text-gray-300">
                                            {investigative_report.high_impact_findings.map((finding, i) => <li key={i}>{finding}</li>)}
                                        </ul>
                                     </div>
                                )}
                            </InfoCard>
                        )}


                        <InfoCard icon={Brain} title="Resumo Executivo da IA" className="lg:col-span-5">
                            <p className="text-gray-300 italic whitespace-pre-wrap">{prediction.executive_summary}</p>
                        </InfoCard>

                        <InfoCard icon={ListChecks} title="Fatores Chave Decisivos" className="lg:col-span-3">
                            <ul className="space-y-3 list-disc list-inside text-gray-300">
                            {prediction.key_factors?.map((factor, i) => <li key={i}><span className="font-semibold text-white">{factor.split(':')[0]}:</span>{factor.split(':')[1]}</li>)}
                            </ul>
                        </InfoCard>
                        <InfoCard icon={AlertTriangle} title="Fatores de Risco" className="lg:col-span-2">
                            <ul className="space-y-3 list-disc list-inside text-gray-300">
                            {prediction.risk_factors?.map((factor, i) => <li key={i}><span className="font-semibold text-white">{factor.split(':')[0]}:</span>{factor.split(':')[1]}</li>)}
                            </ul>
                        </InfoCard>
                    </div>
                )}
                {activeTab === 'data' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <TeamDataCard title="Dossiê Corinthians" team={corinthians_stats} />
                        <TeamDataCard title={`Dossiê ${opponent}`} team={opponent_stats} />
                    </div>
                     <InfoCard icon={Swords} title="Confrontos Históricos">
                        <div className="text-center grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div><p className="text-2xl font-bold text-white">{head_to_head.corinthians_wins}</p><p className="text-sm text-gray-400">Vitórias Corinthians</p></div>
                            <div><p className="text-2xl font-bold text-white">{head_to_head.draws}</p><p className="text-sm text-gray-400">Empates</p></div>
                            <div><p className="text-2xl font-bold text-white">{head_to_head.opponent_wins}</p><p className="text-sm text-gray-400">Vitórias {opponent}</p></div>
                            <div><p className="text-2xl font-bold text-white">{head_to_head.total_matches}</p><p className="text-sm text-gray-400">Total de Jogos</p></div>
                        </div>
                         <h4 className="font-semibold text-white mt-6 mb-2">Resumo de Confrontos Notáveis:</h4>
                         <p className="text-gray-300 italic whitespace-pre-wrap">{head_to_head.notable_matches_summary}</p>
                     </InfoCard>
                  </div>
                )}
                {activeTab === 'tactical' && (
                  <div className="space-y-6">
                    <InfoCard icon={Shield} title="Análise Tática">
                        <p className="text-gray-300 mb-4 whitespace-pre-wrap"><strong className="text-white">Dinâmica Prevista:</strong> {tactical_analysis.predicted_dynamics}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-center">
                            <div className="bg-black/20 p-3 rounded-lg"><p className="text-gray-400">Formação Corinthians</p><p className="font-bold text-white text-lg">{tactical_analysis.corinthians_formation}</p></div>
                            <div className="bg-black/20 p-3 rounded-lg"><p className="text-gray-400">Formação {opponent}</p><p className="font-bold text-white text-lg">{tactical_analysis.opponent_formation}</p></div>
                        </div>
                        <h4 className="font-semibold text-white mb-2">Duelos Táticos Importantes:</h4>
                        <ul className="space-y-2 list-disc list-inside text-gray-300">
                        {tactical_analysis.key_matchups?.map((battle, i) => <li key={i}>{battle}</li>)}
                        </ul>
                        <br/>
                        <h4 className="font-semibold text-white mb-2">Batalhas Táticas:</h4>
                        <p className="text-gray-300 whitespace-pre-wrap">{prediction.tactical_insights.summary}</p>
                    </InfoCard>
                    {tactical_analysis.heatmap_image_base64 && (
                        <InfoCard icon={Map} title="Mapa de Calor Tático Previsto">
                            <img src={`data:image/png;base64,${tactical_analysis.heatmap_image_base64}`} alt={tactical_analysis.heatmap_description} className="rounded-lg w-full border border-corinthians-gray/50"/>
                            <p className="text-sm text-gray-300 mt-4 italic">{tactical_analysis.heatmap_description}</p>
                        </InfoCard>
                    )}
                  </div>
                )}
                {activeTab === 'stats' && (
                    <div>
                        {!prediction.predicted_stats ? (
                            <InfoCard icon={BarChart2} title="Previsão Estatística">
                                <p className="text-gray-400 text-center">Dados estatísticos não disponíveis para esta análise.</p>
                            </InfoCard>
                        ) : (
                            <InfoCard icon={BarChart2} title="Previsão Estatística">
                               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="mb-8 lg:mb-0">
                                        <h4 className="text-center text-lg font-bold text-white mb-2">Posse de Bola</h4>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <PieChart>
                                                <Pie
                                                    data={possessionPieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={renderCustomizedLabel}
                                                    innerRadius={60}
                                                    outerRadius={90}
                                                    fill="#8884d8"
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {possessionPieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend wrapperStyle={{fontSize: "14px", marginTop: "10px"}}/>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div>
                                        <h4 className="text-center text-lg font-bold text-white mb-4">Comparativo de Gols Esperados</h4>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <RechartsBarChart data={goalsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} layout="vertical">
                                                <XAxis type="number" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis type="category" dataKey="name" hide />
                                                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255, 255, 255, 0.1)'}} />
                                                <Legend wrapperStyle={{fontSize: "14px"}}/>
                                                <Bar dataKey="Corinthians" fill="#FFFFFF" radius={[0, 4, 4, 0]} barSize={30} />
                                                <Bar dataKey={opponent} fill="#D4AF37" radius={[0, 4, 4, 0]} barSize={30} />
                                            </RechartsBarChart>
                                        </ResponsiveContainer>
                                    </div>
                               </div>

                                <div className="mt-8 border-t border-corinthians-gray/50 pt-8">
                                    <h4 className="text-center text-lg font-bold text-white mb-4">Comparativo de Ações</h4>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RechartsBarChart data={barChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255, 255, 255, 0.1)'}} />
                                            <Legend wrapperStyle={{fontSize: "14px"}} />
                                            <Bar dataKey="Corinthians" fill="#FFFFFF" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey={opponent} fill="#D4AF37" radius={[4, 4, 0, 0]} />
                                        </RechartsBarChart>
                                    </ResponsiveContainer>
                                </div>
                            </InfoCard>
                        )}
                    </div>
                )}
                 {activeTab === 'players' && (
                    <InfoCard icon={UserCheck} title="Impacto dos Jogadores Chave">
                        <div className="space-y-6">
                        {prediction.player_impacts?.map((p, i) => {
                            const playerAnalysis = findKeyPlayerAnalysis(p.player_name, p.team);
                            return (
                                <div key={i} className="p-4 bg-black/30 rounded-lg border-l-4 border-corinthians-gold/50">
                                    <p className="font-bold text-white text-lg">{p.player_name} <span className="text-sm font-normal text-gray-400">({p.team})</span></p>
                                    <p className="text-gray-300 mt-2 italic">{p.expected_impact}</p>
                                    
                                    <div className="mt-3 border-t border-corinthians-gray/30 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {p.role_in_match && (
                                            <div>
                                                <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Papel Tático</p>
                                                <p className="text-sm text-white">{p.role_in_match}</p>
                                            </div>
                                        )}
                                        {p.key_statistic && (
                                            <div>
                                                <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Estatística Chave</p>
                                                <p className="text-sm text-white">{p.key_statistic}</p>
                                            </div>
                                        )}
                                        {playerAnalysis?.recent_physical_summary && (
                                            <div className="sm:col-span-2">
                                                <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase flex items-center gap-1"><HeartPulse className="w-3 h-3"/>Condição Física Recente</p>
                                                <p className="text-sm text-white">{playerAnalysis.recent_physical_summary}</p>
                                            </div>
                                        )}
                                    </div>

                                    {playerAnalysis?.individual_heatmap_base64 && (
                                        <div className="mt-4 border-t border-corinthians-gray/30 pt-4">
                                            <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase mb-2">Mapa de Calor Individual</p>
                                             <img src={`data:image/png;base64,${playerAnalysis.individual_heatmap_base64}`} alt={`Mapa de calor para ${p.player_name}`} className="rounded-lg w-full sm:w-2/3 border border-corinthians-gray/50"/>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                        </div>
                    </InfoCard>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisReport;