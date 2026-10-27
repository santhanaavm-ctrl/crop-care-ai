import os
from collections import defaultdict
from PIL import Image
import numpy as np

base = 'ai/external_datasets/plantdoc/PlantDoc-Dataset-master'
train_dir = os.path.join(base, 'train')
test_dir = os.path.join(base, 'test')

counts = defaultdict(lambda: {'train': 0, 'test': 0})

for c in os.listdir(train_dir):
    cp = os.path.join(train_dir, c)
    if os.path.isdir(cp):
        counts[c]['train'] = len([f for f in os.listdir(cp) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])

for c in os.listdir(test_dir):
    cp = os.path.join(test_dir, c)
    if os.path.isdir(cp):
        counts[c]['test'] = len([f for f in os.listdir(cp) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])

# Extract crop species and health status
crops = set()
healthy_classes = []
disease_classes = []

for c in sorted(counts.keys()):
    c_lower = c.lower()
    # Extract crop
    if 'apple' in c_lower:
        crop = 'Apple'
    elif 'bell_pepper' in c_lower or 'pepper' in c_lower:
        crop = 'Bell Pepper'
    elif 'blueberry' in c_lower:
        crop = 'Blueberry'
    elif 'cherry' in c_lower:
        crop = 'Cherry'
    elif 'corn' in c_lower:
        crop = 'Corn'
    elif 'peach' in c_lower:
        crop = 'Peach'
    elif 'potato' in c_lower:
        crop = 'Potato'
    elif 'raspberry' in c_lower:
        crop = 'Raspberry'
    elif 'soyabean' in c_lower or 'soybean' in c_lower:
        crop = 'Soybean'
    elif 'squash' in c_lower:
        crop = 'Squash'
    elif 'strawberry' in c_lower:
        crop = 'Strawberry'
    elif 'tomato' in c_lower:
        crop = 'Tomato'
    elif 'grape' in c_lower:
        crop = 'Grape'
    else:
        crop = 'Other'
    crops.add(crop)

    # Health vs disease
    if c_lower in ['apple leaf', 'bell_pepper leaf', 'blueberry leaf', 'cherry leaf', 'peach leaf', 
                   'raspberry leaf', 'soyabean leaf', 'strawberry leaf', 'tomato leaf', 'grape leaf']:
        healthy_classes.append((crop, c))
    else:
        disease_classes.append((crop, c))

print("=" * 75)
print("PLANTDOC DATASET AUDIT REPORT")
print("=" * 75)
print(f"Total Unique Classes      : {len(counts)}")
print(f"Distinct Crop Species     : {len(crops)} ({', '.join(sorted(crops))})")
print(f"Supported Healthy Classes : {len(healthy_classes)}")
print(f"Supported Disease Classes : {len(disease_classes)}")
print("-" * 75)

print(f"{'Class Name':<45} | {'Train':<6} | {'Test':<6} | {'Total':<6}")
print("-" * 75)
total_train = 0
total_test = 0
for c in sorted(counts.keys()):
    tr = counts[c]['train']
    te = counts[c]['test']
    total_train += tr
    total_test += te
    print(f"{c:<45} | {tr:<6} | {te:<6} | {tr+te:<6}")
print("-" * 75)
print(f"{'TOTAL':<45} | {total_train:<6} | {total_test:<6} | {total_train+total_test:<6}")
print("=" * 75)
