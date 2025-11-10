import { Match } from '../types';

// NOTE: This assumes your Flask backend is running on localhost:5000.
// You may need to adjust this URL in a production environment.
const API_BASE_URL = 'http://localhost:5000';

interface FormData {
  opponent: string;
  competition: string;
  match_date: string;
  venue: 'Casa' | 'Fora';
  produto?: string; // Adding fields from Python backend
  publico?: string;
  segmento?: string;
}

interface WorkflowStartResponse {
    success: boolean;
    session_id: string;
    message: string;
}

export interface WorkflowStatusResponse {
    session_id: string;
    current_step: number;
    step_status: {
        step1: 'pending' | 'completed' | 'failed';
        step2: 'pending' | 'completed' | 'failed';
        step3: 'pending' | 'completed' | 'failed';
        step4: 'pending' | 'completed' | 'failed';
        cpl_devastador: 'pending' | 'completed' | 'failed';
    };
    progress_percentage: number;
    error?: string;
}

// Helper to make fetch requests
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Falha na requisição para o backend.' }));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error(`API call failed for endpoint ${endpoint}:`, error);
        if (error instanceof Error && error.message.includes('Failed to fetch')) {
             throw new Error(`Não foi possível conectar ao servidor de análise. Verifique se o backend está rodando em ${API_BASE_URL} e se o CORS está habilitado.`);
        }
        throw error;
    }
}


export async function startFullWorkflow(formData: FormData, specialDirectives: string): Promise<string> {
    const payload = {
        segmento: `Análise de partida de futebol: Corinthians vs ${formData.opponent}`,
        produto: formData.competition,
        publico: `Torcedores e analistas de futebol`,
        // Include original form data and directives for the backend to use.
        context: {
            ...formData,
            specialDirectives,
        }
    };

    const response = await fetchApi<WorkflowStartResponse>('/api/workflow/full_workflow/start', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    
    if (!response.success || !response.session_id) {
        throw new Error(response.message || 'Falha ao iniciar o fluxo de trabalho no backend.');
    }
    
    return response.session_id;
}

export async function getWorkflowStatus(sessionId: string): Promise<WorkflowStatusResponse> {
    return fetchApi<WorkflowStatusResponse>(`/api/workflow/status/${sessionId}`);
}

// This function calls the new backend endpoint to get the final analysis data.
export async function getFinalAnalysisData(sessionId: string): Promise<any> {
     try {
        // This endpoint returns the content of `sintese_master_synthesis.json`.
        const synthesisData = await fetchApi<any>(`/api/workflow/results/synthesis/${sessionId}`);
        return synthesisData;
    } catch (e) {
        console.error(`Could not fetch final analysis data for session ${sessionId}.`, e);
        throw new Error('Não foi possível buscar os dados finais da análise. Verifique o log do backend para garantir que o arquivo de síntese foi gerado corretamente.');
    }
}
