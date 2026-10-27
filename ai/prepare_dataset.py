import os
import shutil
import random

# ==============================
# Paths
# ==============================

SOURCE_DIR = r"C:\Users\Santhana Sathiskumar\Downloads\PlantVillage-Dataset-master\PlantVillage-Dataset-master\raw\color"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

TRAIN_DIR = os.path.join(BASE_DIR, "dataset", "train")
VAL_DIR = os.path.join(BASE_DIR, "dataset", "validation")
TEST_DIR = os.path.join(BASE_DIR, "dataset", "test")


# ==============================
# Dataset split
# ==============================

TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
TEST_RATIO = 0.15

random.seed(42)


# ==============================
# Create directories
# ==============================

os.makedirs(TRAIN_DIR, exist_ok=True)
os.makedirs(VAL_DIR, exist_ok=True)
os.makedirs(TEST_DIR, exist_ok=True)


# ==============================
# Get class folders
# ==============================

classes = [
    folder
    for folder in os.listdir(SOURCE_DIR)
    if os.path.isdir(os.path.join(SOURCE_DIR, folder))
]

classes.sort()

print(f"Found {len(classes)} classes.")

if not classes:
    raise Exception("No class folders found. Check SOURCE_DIR.")


# ==============================
# Process each class
# ==============================

for class_name in classes:

    source_class_dir = os.path.join(SOURCE_DIR, class_name)

    train_class_dir = os.path.join(TRAIN_DIR, class_name)
    val_class_dir = os.path.join(VAL_DIR, class_name)
    test_class_dir = os.path.join(TEST_DIR, class_name)

    os.makedirs(train_class_dir, exist_ok=True)
    os.makedirs(val_class_dir, exist_ok=True)
    os.makedirs(test_class_dir, exist_ok=True)

    images = [
        file
        for file in os.listdir(source_class_dir)
        if file.lower().endswith((".jpg", ".jpeg", ".png"))
    ]

    random.shuffle(images)

    total = len(images)

    train_end = int(total * TRAIN_RATIO)
    val_end = train_end + int(total * VAL_RATIO)

    train_images = images[:train_end]
    val_images = images[train_end:val_end]
    test_images = images[val_end:]

    print(
        f"{class_name}: "
        f"{len(train_images)} train, "
        f"{len(val_images)} validation, "
        f"{len(test_images)} test"
    )

    # Copy training images
    for image in train_images:
        shutil.copy2(
            os.path.join(source_class_dir, image),
            os.path.join(train_class_dir, image)
        )

    # Copy validation images
    for image in val_images:
        shutil.copy2(
            os.path.join(source_class_dir, image),
            os.path.join(val_class_dir, image)
        )

    # Copy test images
    for image in test_images:
        shutil.copy2(
            os.path.join(source_class_dir, image),
            os.path.join(test_class_dir, image)
        )


print("\nDataset preparation completed successfully!")