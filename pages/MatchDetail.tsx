import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { Match } from '../types';
import AnalysisReport from '../components/AnalysisReport';

interface MatchDetailProps {
  matches: Match[];
  addOrUpdateMatch: (match: Match) => void;
}

const MatchDetail: React.FC<MatchDetailProps> = ({ matches, addOrUpdateMatch }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const match = matches.find(m => m.id === id);

  if (!match || match.status !== 'Análise Concluída') {
    // Se a partida não for encontrada ou a análise não estiver concluída, redireciona para a lista de partidas.
    return <Navigate to="/partidas" replace />;
  }

  const handleNavigateBack = () => {
    navigate('/partidas');
  };
  
  return (
    <AnalysisReport
      match={match}
      onBack={handleNavigateBack}
      addOrUpdateMatch={addOrUpdateMatch}
    />
  );
};

export default MatchDetail;