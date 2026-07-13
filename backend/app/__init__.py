import sys
import os

# Resolve paths to the ml-model directory
current_dir = os.path.dirname(os.path.abspath(__file__))      # backend/app
backend_dir = os.path.dirname(current_dir)                    # backend
project_root = os.path.dirname(backend_dir)                   # project_root
ml_model_dir = os.path.join(project_root, "ml-model")         # project_root/ml-model

# Inject into path if not present
if ml_model_dir not in sys.path:
    sys.path.insert(0, ml_model_dir)
