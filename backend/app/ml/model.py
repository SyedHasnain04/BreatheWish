import torch
import torch.nn as nn
from torchvision import models
from app.config import settings
import os

class PneumoniaModel(nn.Module):
    def __init__(self):
        super(PneumoniaModel, self).__init__()
        self.densenet = models.densenet121(weights=None)
        num_features = self.densenet.classifier.in_features
        self.densenet.classifier = nn.Linear(num_features, 2)
    
    def forward(self, x):
        return self.densenet(x)

def load_model(weights_path: str = None) -> PneumoniaModel:
    model = PneumoniaModel()
    if weights_path is None:
        weights_path = settings.ML_MODEL_PATH
    
    if os.path.exists(weights_path):
        state_dict = torch.load(weights_path, map_location=torch.device("cpu"))
        model.load_state_dict(state_dict, strict=False)
        print(f"Loaded weights from {weights_path}")
    else:
        print(f"No weights found at {weights_path}, using random initialization")
    
    model.eval()
    return model
