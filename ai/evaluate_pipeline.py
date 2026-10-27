import os
os.environ["KERAS_BACKEND"] = "torch"
import keras
import json
import numpy as np
from PIL import Image
from collections import defaultdict

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "plant_disease_model.keras")
CLASS_NAMES_PATH = os.path.join(BASE_DIR, "models", "class_names.json")
VAL_DIR = os.path.join(BASE_DIR, "dataset", "validation")
TEST_DIR = os.path.join(BASE_DIR, "dataset", "test")

with open(CLASS_NAMES_PATH, "r") as f:
    class_names = json.load(f)

# Build species mapping
species_list = sorted(list(set([c.split("___")[0] for c in class_names])))
species_to_classes = defaultdict(list)
class_to_species = {}
for i, c in enumerate(class_names):
    sp = c.split("___")[0]
    species_to_classes[sp].append(i)
    class_to_species[i] = sp

print(f"Loaded {len(class_names)} classes across {len(species_list)} species:")
for sp, cls_indices in species_to_classes.items():
    print(f"  {sp:<25}: {len(cls_indices)} conditions")

# Load model
print("\nLoading model with Keras PyTorch backend...")
model = keras.models.load_model(MODEL_PATH, compile=False)
print("Model loaded successfully.")

def evaluate_split(split_name, split_dir, samples_per_class=20, batch_size=32):
    print(f"\n--- Evaluating {split_name} (up to {samples_per_class} per class) ---")
    
    all_images = []
    all_true_classes = []
    
    for cls_idx, cls_name in enumerate(class_names):
        cls_dir = os.path.join(split_dir, cls_name)
        if not os.path.exists(cls_dir):
            continue
        files = [f for f in os.listdir(cls_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))][:samples_per_class]
        for f in files:
            all_images.append(os.path.join(cls_dir, f))
            all_true_classes.append(cls_idx)
            
    print(f"Total samples collected: {len(all_images)}")
    
    all_probs = []
    
    for i in range(0, len(all_images), batch_size):
        batch_paths = all_images[i:i+batch_size]
        batch_tensors = []
        for p in batch_paths:
            img = Image.open(p).convert('RGB').resize((224, 224))
            batch_tensors.append(np.array(img, dtype=np.float32))
        batch_arr = np.array(batch_tensors)
        # Predict batch
        preds = model.predict(batch_arr, verbose=0)
        all_probs.append(preds)
        
    probs_matrix = np.vstack(all_probs)
    y_true = np.array(all_true_classes)
    y_pred = np.argmax(probs_matrix, axis=1)
    
    # 1. Disease accuracy
    disease_correct = np.sum(y_true == y_pred)
    disease_acc = disease_correct / len(y_true)
    
    # 2. Species accuracy
    true_species = np.array([class_to_species[i] for i in y_true])
    pred_species = np.array([class_to_species[i] for i in y_pred])
    species_correct = np.sum(true_species == pred_species)
    species_acc = species_correct / len(y_true)
    
    # 3. Check Apple -> Strawberry specifically
    apple_mask = (true_species == "Apple")
    apple_total = np.sum(apple_mask)
    apple_pred_strawberry = np.sum((pred_species == "Strawberry") & apple_mask)
    apple_correct_species = np.sum((pred_species == "Apple") & apple_mask)
    apple_correct_disease = np.sum((y_pred == y_true) & apple_mask)
    
    # 4. Two-stage hierarchical validation:
    # Compute P(Species) by summing probabilities belonging to each species
    species_prob_matrix = np.zeros((len(y_true), len(species_list)))
    for s_idx, sp in enumerate(species_list):
        species_prob_matrix[:, s_idx] = np.sum(probs_matrix[:, species_to_classes[sp]], axis=1)
    
    two_stage_pred_species_idx = np.argmax(species_prob_matrix, axis=1)
    two_stage_pred_species = [species_list[idx] for idx in two_stage_pred_species_idx]
    two_stage_species_correct = np.sum(true_species == np.array(two_stage_pred_species))
    two_stage_species_acc = two_stage_species_correct / len(y_true)
    
    # 5. Top-1 confidence statistics
    max_probs = np.max(probs_matrix, axis=1)
    avg_conf_correct = np.mean(max_probs[y_true == y_pred]) if np.sum(y_true == y_pred) > 0 else 0
    avg_conf_incorrect = np.mean(max_probs[y_true != y_pred]) if np.sum(y_true != y_pred) > 0 else 0
    
    print(f"Disease Class Accuracy (Top-1): {disease_acc * 100:.2f}% ({disease_correct}/{len(y_true)})")
    print(f"Plant Species Accuracy:         {species_acc * 100:.2f}% ({species_correct}/{len(y_true)})")
    print(f"Two-Stage Species Accuracy:     {two_stage_species_acc * 100:.2f}% ({two_stage_species_correct}/{len(y_true)})")
    print(f"Apple Samples Evaluated:        {apple_total}")
    print(f"Apple Correct Species:          {apple_correct_species}/{apple_total} ({apple_correct_species/apple_total*100:.1f}%)")
    print(f"Apple Correct Disease:          {apple_correct_disease}/{apple_total} ({apple_correct_disease/apple_total*100:.1f}%)")
    print(f"Apple -> Strawberry Confusion:  {apple_pred_strawberry}/{apple_total}")
    print(f"Average Confidence (Correct):   {avg_conf_correct * 100:.2f}%")
    print(f"Average Confidence (Incorrect): {avg_conf_incorrect * 100:.2f}%")
    
    return {
        "probs": probs_matrix,
        "y_true": y_true,
        "y_pred": y_pred,
        "disease_acc": disease_acc,
        "species_acc": species_acc,
        "apple_pred_strawberry": apple_pred_strawberry
    }

val_results = evaluate_split("Validation Set", VAL_DIR, samples_per_class=20)
test_results = evaluate_split("Test Set", TEST_DIR, samples_per_class=20)
