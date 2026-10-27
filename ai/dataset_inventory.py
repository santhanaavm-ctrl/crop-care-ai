import os
import json
from collections import defaultdict
from PIL import Image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = BASE_DIR
DATASET_DIR = os.path.join(PROJECT_DIR, "dataset")

inventory = {}
splits = ["train", "validation", "test"]

all_classes = set()
for s in splits:
    s_dir = os.path.join(DATASET_DIR, s)
    if os.path.exists(s_dir):
        all_classes.update([d for d in os.listdir(s_dir) if os.path.isdir(os.path.join(s_dir, d))])

sorted_classes = sorted(list(all_classes))

print(f"Total unique classes identified: {len(sorted_classes)}")

species_summary = defaultdict(lambda: {"classes": [], "train": 0, "val": 0, "test": 0})
table_rows = []

for c in sorted_classes:
    species = c.split("___")[0] if "___" in c else "Unknown"
    disease = c.split("___")[1] if "___" in c else c
    
    counts = {}
    for s in splits:
        p = os.path.join(DATASET_DIR, s, c)
        if os.path.exists(p):
            imgs = [f for f in os.listdir(p) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
            counts[s] = len(imgs)
        else:
            counts[s] = 0
            
    species_summary[species]["classes"].append(disease)
    species_summary[species]["train"] += counts["train"]
    species_summary[species]["val"] += counts["validation"]
    species_summary[species]["test"] += counts["test"]
    
    total = counts["train"] + counts["validation"] + counts["test"]
    table_rows.append((species, disease, counts["train"], counts["validation"], counts["test"], total))

print("\n--- CLASS INVENTORY ---")
print(f"{'Species':<25} | {'Condition':<40} | {'Train':<6} | {'Val':<6} | {'Test':<6} | {'Total':<6}")
print("-" * 95)
for r in table_rows:
    print(f"{r[0]:<25} | {r[1]:<40} | {r[2]:<6} | {r[3]:<6} | {r[4]:<6} | {r[5]:<6}")

print("\n--- SPECIES AGGREGATE SUMMARY ---")
for sp, data in species_summary.items():
    tot = data['train'] + data['val'] + data['test']
    print(f"{sp:<25}: {len(data['classes'])} classes | Train: {data['train']:<5} | Val: {data['val']:<5} | Test: {data['test']:<5} | Total: {tot:<5}")
