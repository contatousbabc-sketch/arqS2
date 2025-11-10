import logging
import os
from flask import Flask, jsonify
from flask_cors import CORS

# Import the blueprint from the other file
try:
    from enhanced_workflow_routes import enhanced_workflow_bp
except ImportError as e:
    # This helps in debugging if the file is not found or has issues.
    print(f"Não foi possível importar o blueprint: {e}")
    enhanced_workflow_bp = None

# Configure basic logging
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create Flask application
app = Flask(__name__)

# Enable CORS (Cross-Origin Resource Sharing) for all routes starting with /api/
# This allows the frontend (running on a different origin) to communicate with the backend.
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Ensure necessary directories for storing analysis data exist
try:
    os.makedirs("analyses_data/files", exist_ok=True)
    os.makedirs("analyses_data/workflow", exist_ok=True)
    logger.info("✅ Diretórios para dados de análise estão prontos.")
except OSError as e:
    logger.error(f"❌ Erro ao criar diretórios: {e}")

# Register the blueprint containing all the workflow routes
if enhanced_workflow_bp:
    app.register_blueprint(enhanced_workflow_bp, url_prefix='/api')
    logger.info("✅ Blueprint do workflow registrado com sucesso no prefixo /api.")
else:
    logger.error("❌ Blueprint do workflow não foi carregado. Endpoints da API não estarão disponíveis.")

# A simple root route to check if the server is running
@app.route('/')
def index():
    return "Backend de Predição de IA do Corinthians está rodando."

# A health check endpoint for the API
@app.route('/api/health')
def health_check():
    return jsonify({"status": "ok", "message": "Backend está saudável."})

# This block allows running the server directly from the script
if __name__ == '__main__':
    # Note: Flask's development server is not suitable for production.
    # Use a production-ready WSGI server like Gunicorn or uWSGI.
    logger.info("🚀 Iniciando servidor Flask de desenvolvimento em http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
