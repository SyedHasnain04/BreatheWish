import torch
import numpy as np
from PIL import Image
import io


def generate_gradcam(model, input_tensor: torch.Tensor, original_image_bytes: bytes) -> bytes:
    """Generate Grad-CAM overlay on the original image. Returns PNG bytes."""
    try:
        import cv2
        from pytorch_grad_cam import GradCAM
        from pytorch_grad_cam.utils.image import show_cam_on_image
        from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget

        # Target layer: denseblock4.denselayer16.conv2
        target_layer = model.densenet.features.denseblock4.denselayer16.conv2

        cam = GradCAM(model=model, target_layers=[target_layer])

        # Get the predicted class
        with torch.no_grad():
            output = model(input_tensor)
            pred_class = output.argmax(dim=1).item()

        # Generate CAM
        targets = [ClassifierOutputTarget(pred_class)]
        grayscale_cam = cam(input_tensor=input_tensor, targets=targets)
        grayscale_cam = grayscale_cam[0, :]

        # Load and resize original image for overlay
        original = Image.open(io.BytesIO(original_image_bytes)).convert("RGB")
        original = original.resize((224, 224))
        original_np = np.array(original).astype(np.float32) / 255.0

        # Create overlay
        visualization = show_cam_on_image(original_np, grayscale_cam, use_rgb=True)

        # Convert to PNG bytes
        _, buffer = cv2.imencode(".png", cv2.cvtColor(visualization, cv2.COLOR_RGB2BGR))
        return buffer.tobytes()
    except Exception as e:
        print(f"GradCAM generation error ({e}), returning original image")
        return original_image_bytes
