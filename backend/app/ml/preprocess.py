import torch
from torchvision import transforms
from PIL import Image
import io

TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.Grayscale(num_output_channels=3),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def preprocess_image(image_bytes: bytes) -> torch.Tensor:
    """Preprocess raw image bytes into a model-ready tensor."""
    image = Image.open(io.BytesIO(image_bytes)).convert("L")  # grayscale
    tensor = TRANSFORM(image)
    return tensor.unsqueeze(0)  # add batch dimension
