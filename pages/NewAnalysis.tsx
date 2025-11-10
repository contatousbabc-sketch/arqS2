import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, ArrowLeft, CheckCircle, Wand2, Eye, Info, Zap, Cloud, HardDrive, Loader2, UploadCloud, AlertTriangle, RefreshCw, Server } from "lucide-react";
import { Match, Player, AutoCollectedData, Prediction } from '../types';
import * as workflowService from '../services/workflowService';
import { WorkflowStatusResponse } from '../services/workflowService';
import AnalysisReport from '../components/AnalysisReport';
import LiveLog from '../components/LiveLog';

interface NewAnalysisProps {
  addOrUpdateMatch: (match: Match) => void;
  updatePlayers: (players: Player[] | undefined) => void;
}

// Helper function to map the backend's synthesis JSON to the frontend's Match object structure
const mapSynthesisToMatch = (synthesisData: any, currentMatch: Match): Match => {
    const prediction: Partial<Prediction> = {};
    const auto_collected_data: Partial<AutoCollectedData> = { ...currentMatch.auto_collected_data };

    // Map executive summary and key factors
    prediction.executive_summary = synthesisData.insights_principais?.join('\n') || 'Resumo não disponível. Verifique o arquivo de síntese no backend.';
    prediction.key_factors = synthesisData.pontos_atencao_criticos || [];
    prediction.risk_factors = synthesisData.dados_mercado_validados?.ameacas_identificadas || [];
    
    // Attempt to infer winner from summary text
    const summaryText = (prediction.executive_summary || '').toLowerCase();
    const opponentName = currentMatch.opponent.toLowerCase();
    if (summaryText.includes('vitória do corinthians') || summaryText.includes('corinthians tem vantagem') || summaryText.includes('favoritismo para o corinthians')) {
        prediction.winner = 'Corinthians';
    } else if (summaryText.includes(`vitória do ${opponentName}`) || summaryText.includes(`${opponentName} tem vantagem`) || summaryText.includes(`favoritismo para o ${opponentName}`)) {
        prediction.winner = currentMatch.opponent;
    } else if (summaryText.includes('empate')) {
        prediction.winner = 'Empate';
    } else {
        prediction.winner = 'Indefinido';
    }

    // Map confidence score
    const confidenceStr = synthesisData.validacao_dados?.nivel_confianca || '0%';
    prediction.confidence_score = parseFloat(confidenceStr.replace('%', '')) / 100;
    prediction.confidence_breakdown = `Nível de confiança baseado na validação de dados do backend: ${confidenceStr}.`;

    // Placeholders for quantitative data not present in this specific synthesis JSON.
    // A more advanced backend endpoint could consolidate these from multiple generated files.
    prediction.home_win_probability = 0.33;
    prediction.away_win_probability = 0.33;
    prediction.draw_probability = 0.34;
    prediction.expected_goals_corinthians = 1.2;
    prediction.expected_goals_opponent = 1.1;
    
    // Note: The backend synthesis focuses on qualitative analysis.
    // Detailed stats (squad, H2H, tactical analysis) are not in the main synthesis JSON.
    // This part of the report will be sparse until the backend provides more consolidated data.
    auto_collected_data.squad_data = { players: [] }; 

    return {
        ...currentMatch,
        status: 'Análise Concluída',
        prediction: prediction as Prediction,
        auto_collected_data: auto_collected_data as AutoCollectedData,
        error: undefined,
    };
};


const NewAnalysis: React.FC<NewAnalysisProps> = ({ addOrUpdateMatch, updatePlayers }) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    opponent: '',
    competition: 'Brasileirão',
    match_date: '',
    venue: 'Casa' as 'Casa' | 'Fora',
  });
  
  const [specialDirectives, setSpecialDirectives] = useState('');
  const [isDeepDive, setIsDeepDive] = useState(false);
  
  const [pageState, setPageState] = useState<'form' | 'analyzing' | 'result'>('form');
  const [log, setLog] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const pollingIntervalRef = useRef<number | null>(null);

  const stepMessages: { [key: number]: string } = {
    0: 'Iniciando fluxo de trabalho...',
    1: 'ETAPA 1: Coleta massiva de dados em andamento...',
    2: 'ETAPA 2: Verificação dos dados com IA externa...',
    3: 'ETAPA 3: Síntese e análise profunda dos dados...',
    4: 'ETAPA 4: Geração dos 16 módulos de inteligência...',
    5: 'ETAPA FINAL: Executando protocolo CPL Devastador...',
  };

  const addLog = (message: string) => {
    setLog(prev => [...prev, message]);
  };
  
  useEffect(() => {
    // Cleanup polling on component unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);
  
  // Polling effect
  useEffect(() => {
    if (sessionId && pageState === 'analyzing') {
      pollingIntervalRef.current = window.setInterval(async () => {
        try {
          const status = await workflowService.getWorkflowStatus(sessionId);
          
          const currentStepMessage = stepMessages[status.current_step];
          const logMessage = `[CRITICAL] ${currentStepMessage} (${status.progress_percentage}%)`;

          if (currentStepMessage && !log.some(l => l.startsWith(`[CRITICAL] ${currentStepMessage}`))) {
            addLog(logMessage);
          }

          if (status.progress_percentage >= 100 || status.error) {
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            
            if (status.error) {
                throw new Error(status.error);
            }

            addLog('[SUCCESS] Análise do backend concluída. Buscando e processando resultados finais...');
            setIsLoading(true);
            try {
                const synthesisData = await workflowService.getFinalAnalysisData(sessionId);
                if (!synthesisData) throw new Error("Os dados da síntese final retornaram vazios.");

                addLog('[INFO] Mapeando dados da síntese para o formato do relatório...');
                if(currentMatch){
                    const finalMatch = mapSynthesisToMatch(synthesisData, currentMatch);
                    
                    updatePlayers(finalMatch.auto_collected_data?.squad_data?.players);

                    setAnalysisResult(finalMatch);
                    addOrUpdateMatch(finalMatch);
                    setPageState('result');
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while fetching final results.";
                addLog(`[FATAL_ERROR] ${errorMessage}`);
                if (currentMatch) {
                    addOrUpdateMatch({ ...currentMatch, status: 'Erro', error: errorMessage });
                }
            } finally {
                setIsLoading(false);
            }
          }
        } catch (error) {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during polling.";
          addLog(`[FATAL_ERROR] ${errorMessage}`);
          if (currentMatch) {
             addOrUpdateMatch({ ...currentMatch, status: 'Erro', error: errorMessage });
          }
          setIsLoading(false);
        }
      }, 5000); // Poll every 5 seconds
    }
  }, [sessionId, pageState, log, currentMatch, addOrUpdateMatch, updatePlayers]);

  const startAnalysis = async () => {
    setIsLoading(true);
    setPageState('analyzing');
    setLog([]);

    const newMatch: Match = {
      id: crypto.randomUUID(),
      ...formData,
      status: 'Em Análise',
      user_provided_context: specialDirectives,
    };
    addOrUpdateMatch(newMatch);
    setCurrentMatch(newMatch);
    
    addLog(`[INFO] Solicitação de análise enviada para o backend.`);
    addLog(`[INFO] Adversário: ${formData.opponent}, Competição: ${formData.competition}`);

    try {
      const newSessionId = await workflowService.startFullWorkflow(formData, specialDirectives);
      setSessionId(newSessionId);
      addLog(`[SUCCESS] Fluxo de trabalho iniciado com sucesso. ID da Sessão: ${newSessionId}`);
      addLog('[INFO] O backend está processando. O log será atualizado com o progresso.');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      addLog(`[FATAL_ERROR] ${errorMessage}`);
      addOrUpdateMatch({ ...newMatch, status: 'Erro', error: errorMessage });
      setIsLoading(false);
    } 
  };
  
  const renderContent = () => {
    switch (pageState) {
        case 'analyzing':
            return (
                <div className="min-h-full bg-corinthians-dark p-8 flex items-center justify-center">
                    <div className="max-w-4xl w-full bg-black/50 border border-corinthians-gray rounded-xl p-8">
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                                <Server className="text-corinthians-gold"/> Análise em Andamento no Servidor
                            </h2>
                            <p className="text-gray-400">{`Analisando Corinthians vs ${formData.opponent}`}</p>
                        </div>
                        <LiveLog log={log} />
                        {(isLoading || !log.some(l => l.includes('FATAL_ERROR'))) && (
                            <div className="mt-6 text-center">
                                <p className="text-gray-400 flex items-center justify-center gap-2">
                                  <Loader2 className="w-5 h-5 animate-spin"/> Buscando status do backend...
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            );
       
        case 'result':
            if (analysisResult) {
                return (
                    <AnalysisReport 
                        match={analysisResult} 
                        onBack={() => {
                            setAnalysisResult(null);
                            setPageState('form');
                            setSpecialDirectives('');
                            setIsDeepDive(false);
                        }}
                        addOrUpdateMatch={addOrUpdateMatch}
                    />
                );
            }
            return null;

        case 'form':
        default:
            return (
                <div className="min-h-full bg-corinthians-dark p-8">
                    <div className="max-w-3xl mx-auto">
                        <button onClick={() => navigate('/dashboard')} className="mb-6 text-gray-400 hover:text-white flex items-center gap-2">
                        <ArrowLeft className="w-5 h-5" /> Voltar ao Dashboard
                        </button>

                        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-corinthians-gold bg-clip-text text-transparent mb-2">
                        Análise via Backend
                        </h1>
                        <p className="text-gray-400 mb-8">Inicie uma análise completa no servidor Python. As chaves de API e o processamento pesado ocorrem no backend.</p>
                        
                        <div className="bg-black/50 border border-corinthians-gray rounded-xl p-8">
                        <form onSubmit={(e) => { e.preventDefault(); startAnalysis(); }} className="space-y-6">
                            <div>
                            <label className="block text-gray-300 mb-2 font-semibold">Adversário *</label>
                            <input type="text" value={formData.opponent} onChange={(e) => setFormData({ ...formData, opponent: e.target.value })} placeholder="Ex: Palmeiras" required className="w-full bg-corinthians-gray/50 border border-corinthians-gray text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-corinthians-gold"/>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-300 mb-2 font-semibold">Competição *</label>
                                <select value={formData.competition} onChange={(e) => setFormData({ ...formData, competition: e.target.value })} className="w-full bg-corinthians-gray/50 border border-corinthians-gray text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-corinthians-gold">
                                <option>Brasileirão</option>
                                <option>Libertadores</option>
                                <option>Copa do Brasil</option>
                                <option>Paulistão</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-2 font-semibold">Local *</label>
                                <select value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value as 'Casa' | 'Fora' })} className="w-full bg-corinthians-gray/50 border border-corinthians-gray text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-corinthians-gold">
                                <option value="Casa">Casa</option>
                                <option value="Fora">Fora</option>
                                </select>
                            </div>
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-2 font-semibold">Data e Hora *</label>
                                <input type="datetime-local" value={formData.match_date} onChange={(e) => setFormData({ ...formData, match_date: e.target.value })} required className="w-full bg-corinthians-gray/50 border border-corinthians-gray text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-corinthians-gold"/>
                            </div>
                            
                            <div className="border-t border-corinthians-gray/50 pt-6">
                                <label className={`block mb-2 font-semibold flex items-center gap-2 transition-opacity text-gray-300`}>
                                    <Wand2 className="w-5 h-5"/> Diretivas Especiais (Opcional)
                                </label>
                                <textarea
                                    value={specialDirectives}
                                    onChange={(e) => setSpecialDirectives(e.target.value)}
                                    placeholder="Adicione contexto ou correções. Ex: 'O adversário poupará 3 titulares' ou 'O gramado está em péssimas condições'."
                                    className="w-full h-24 bg-corinthians-gray/50 border border-corinthians-gray text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-corinthians-gold"
                                />
                            </div>
                            
                             {/* The deep dive option is now handled by the backend logic and can be removed, but we keep it as a flag for the backend. */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="deepDive"
                                    checked={isDeepDive}
                                    onChange={(e) => setIsDeepDive(e.target.checked)}
                                    className="h-5 w-5 rounded bg-corinthians-gray/50 border-corinthians-gray text-corinthians-gold focus:ring-corinthians-gold"
                                />
                                <label htmlFor="deepDive" className={`font-semibold flex items-center gap-2 transition-opacity text-gray-300`}>
                                    <Zap className="w-5 h-5"/> Análise Profunda (Deep Dive)
                                </label>
                                <div className="group relative flex items-center">
                                    <Info className="w-4 h-4 text-gray-500"/>
                                    <span className="absolute bottom-full mb-2 w-64 p-2 bg-corinthians-gray text-xs text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    Ativa um agente investigativo no backend para buscar informações de baixo radar. Aumenta o tempo da análise.
                                    </span>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading || !formData.opponent || !formData.match_date}
                                    className="w-full bg-gradient-to-r from-corinthians-gold to-yellow-600 hover:to-yellow-500 text-black font-bold px-8 py-4 rounded-lg flex items-center justify-center gap-3 transition-transform duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
                                >
                                    {isLoading ? <><Loader2 className="w-6 h-6 animate-spin" /> Processando Análise...</> : <><Brain className="w-6 h-6" /> Iniciar Análise no Backend</>}
                                </button>
                            </div>
                        </form>
                        </div>
                    </div>
                </div>
            );
    }
  };

  return renderContent();
};

export default NewAnalysis;