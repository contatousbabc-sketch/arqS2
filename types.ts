export interface PlayerPerformanceStats {
  games_played?: number;
  goals?: number;
  assists?: number;
  rating_average?: number;
}

export interface Player {
  name: string;
  position: 'Goleiro' | 'Zagueiro' | 'Lateral' | 'Meio-Campo' | 'Atacante' | string;
  shirt_number?: number;
  age?: number;
  status: 'Disponível' | 'Lesionado' | 'Suspenso' | 'Dúvida' | string;
  injury_details?: string;
  performance_stats?: PlayerPerformanceStats;
}

export interface KeyPlayerAnalysis {
  player_name: string;
  heatmap_description: string;
  recent_physical_summary: string;
  individual_heatmap_base64?: string;
}

export interface TeamStats {
  team_name: string;
  recent_form: string; // e.g., "V-E-D-V-V"
  playing_style: string;
  key_players: string[];
  injuries_suspensions: string[];
  strengths: string[];
  weaknesses: string[];
  avg_goals_scored: number;
  avg_goals_conceded: number;
  tactical_details: string;
  possession_avg?: number;
  shots_per_game_avg?: number;
  key_player_analysis: KeyPlayerAnalysis[];
  team_motivation: string;
}

export interface H2HData {
  total_matches: number;
  corinthians_wins: number;
  opponent_wins: number;
  draws: number;
  last_5_matches?: {
    date: string;
    score: string;
    winner: string;
  }[];
  notable_matches_summary: string;
}

export interface NewsAndContext {
  key_news_corinthians: string[];
  key_news_opponent: string[];
  match_importance: string;
}

export interface TacticalAnalysis {
  corinthians_formation: string;
  opponent_formation: string;
  key_matchups: string[];
  predicted_dynamics: string;
  heatmap_description: string;
  heatmap_image_base64?: string;
}

export interface PlayerImpact {
    player_name: string;
    team: string;
    expected_impact: string;
    role_in_match?: string;
    key_statistic?: string;
}

export interface PredictedStats {
  possession_corinthians: number;
  possession_opponent: number;
  total_shots_corinthians: number;
  total_shots_opponent: number;
  shots_on_goal_corinthians: number;
  shots_on_goal_opponent: number;
  corners_corinthians: number;
  corners_opponent: number;
  fouls_corinthians: number;
  fouls_opponent: number;
  yellow_cards_corinthians: number;
  yellow_cards_opponent: number;
}

export interface Prediction {
  executive_summary: string;
  winner: string;
  home_win_probability: number;
  draw_probability: number;
  away_win_probability: number;
  expected_goals_corinthians: number;
  expected_goals_opponent: number;
  confidence_score: number;
  confidence_breakdown: string; // New field for detailed explanation
  key_factors: string[];
  tactical_insights: {
    summary: string;
    key_battles: string[];
  };
  risk_factors: string[];
  player_impacts: PlayerImpact[];
  predicted_stats?: PredictedStats;
}

export interface InvestigativeReport {
  high_impact_findings: string[];
  potential_contradictions_found: string[];
  summary: string;
}

export interface AutoCollectedData {
  squad_data: { players: Player[] };
  corinthians_stats: TeamStats;
  opponent_stats: TeamStats;
  head_to_head: H2HData;
  news_and_context: NewsAndContext;
  tactical_analysis: TacticalAnalysis;
  user_provided_context?: string; // To store and show user input
  investigative_report?: InvestigativeReport;
}

export interface Match {
  id: string;
  opponent: string;
  competition: string;
  match_date: string;
  venue: 'Casa' | 'Fora';
  status: 'Agendada' | 'Em Análise' | 'Análise Concluída' | 'Erro';
  auto_collected_data?: AutoCollectedData;
  prediction?: Prediction;
  error?: string;
  user_provided_context?: string;
}