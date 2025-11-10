
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NewAnalysis from './pages/NewAnalysis';
import Matches from './pages/Matches';
import Squad from './pages/Squad';
import MatchDetail from './pages/MatchDetail';
import { Match, Player } from './types';
import useLocalStorage from './hooks/useLocalStorage';

function App() {
  const [matches, setMatches] = useLocalStorage<Match[]>('matches', []);
  const [players, setPlayers] = useLocalStorage<Player[]>('players', []);

  const addOrUpdateMatch = (match: Match) => {
    setMatches(prevMatches => {
      const existingMatchIndex = prevMatches.findIndex(m => m.id === match.id);
      if (existingMatchIndex > -1) {
        const updatedMatches = [...prevMatches];
        updatedMatches[existingMatchIndex] = match;
        return updatedMatches;
      }
      // Add new matches and re-sort by date
      return [match, ...prevMatches].sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime());
    });
  };
  
  const updatePlayers = (newPlayers: Player[] | undefined) => {
    if (!newPlayers) return;
    // Overwrite existing players with the new, most up-to-date list from the analysis
    const playerMap = new Map<string, Player>();
    
    // Add existing players first
    players.forEach(p => playerMap.set(p.name, p));
    // Overwrite and add new players
    newPlayers.forEach(p => playerMap.set(p.name, p));

    setPlayers(Array.from(playerMap.values()));
  }

  const deleteMatch = (matchId: string) => {
    setMatches(prevMatches => prevMatches.filter(m => m.id !== matchId));
  };

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard matches={matches} players={players} />} />
          <Route path="/nova-analise" element={<NewAnalysis addOrUpdateMatch={addOrUpdateMatch} updatePlayers={updatePlayers} />} />
          <Route path="/partidas" element={<Matches matches={matches} deleteMatch={deleteMatch}/>} />
          <Route path="/partidas/:id" element={<MatchDetail matches={matches} addOrUpdateMatch={addOrUpdateMatch} />} />
          <Route path="/elenco" element={<Squad players={players}/>} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;