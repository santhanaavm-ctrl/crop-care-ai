import os
import json
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers


# ==========================================
# Paths
# ==========================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

TRAIN_DIR = os.path.join(BASE_DIR, "dataset", "train")
VAL_DIR = os.path.join(BASE_DIR, "dataset", "validation")

MODEL_DIR = os.path.join(BASE_DIR, "models")

os.makedirs(MODEL_DIR, exist_ok=True)


# ==========================================
# Configuration
# ==========================================

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 10
SEED = 42


# ==========================================
# Load datasets
# ==========================================

print("Loading training dataset...")

train_dataset = keras.utils.image_dataset_from_directory(
    TRAIN_DIR,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=True,
    seed=SEED
)

print("Loading validation dataset...")

validation_dataset = keras.utils.image_dataset_from_directory(
    VAL_DIR,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)


# ==========================================
# Get class names
# ==========================================

class_names = train_dataset.class_names

print("\nClasses found:")
for index, class_name in enumerate(class_names):
    print(index, class_name)

print("\nTotal classes:", len(class_names))


# ==========================================
# Save class names
# ==========================================

class_names_path = os.path.join(
    MODEL_DIR,
    "class_names.json"
)

with open(class_names_path, "w") as file:
    json.dump(class_names, file, indent=4)


# ==========================================
# Improve dataset performance
# ==========================================

AUTOTUNE = tf.data.AUTOTUNE

train_dataset = train_dataset.prefetch(
    buffer_size=AUTOTUNE
)

validation_dataset = validation_dataset.prefetch(
    buffer_size=AUTOTUNE
)


# ==========================================
# Data augmentation
# ==========================================

data_augmentation = keras.Sequential(
    [
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.1),
        layers.RandomZoom(0.1),
    ],
    name="data_augmentation"
)


# ==========================================
# MobileNetV2 base model
# ==========================================

base_model = keras.applications.MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights="imagenet"
)

# Freeze the pretrained layers
base_model.trainable = False


# ==========================================
# Build model
# ==========================================

inputs = keras.Input(
    shape=(224, 224, 3)
)

x = data_augmentation(inputs)

x = keras.applications.mobilenet_v2.preprocess_input(x)

x = base_model(
    x,
    training=False
)

x = layers.GlobalAveragePooling2D()(x)

x = layers.Dropout(0.2)(x)

outputs = layers.Dense(
    len(class_names),
    activation="softmax"
)(x)

model = keras.Model(
    inputs,
    outputs
)


# ==========================================
# Compile model
# ==========================================

model.compile(
    optimizer=keras.optimizers.Adam(
        learning_rate=0.001
    ),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)


# ==========================================
# Display model
# ==========================================

model.summary()


# ==========================================
# Callbacks
# ==========================================

model_path = os.path.join(
    MODEL_DIR,
    "plant_disease_model.keras"
)

callbacks = [
    keras.callbacks.ModelCheckpoint(
        model_path,
        monitor="val_accuracy",
        save_best_only=True,
        verbose=1
    ),

    keras.callbacks.EarlyStopping(
        monitor="val_accuracy",
        patience=3,
        restore_best_weights=True,
        verbose=1
    )
]


# ==========================================
# Train model
# ==========================================

print("\nStarting model training...\n")

history = model.fit(
    train_dataset,
    validation_data=validation_dataset,
    epochs=EPOCHS,
    callbacks=callbacks
)


# ==========================================
# Save final model
# ==========================================

final_model_path = os.path.join(
    MODEL_DIR,
    "plant_disease_model_final.keras"
)

model.save(final_model_path)


print("\n===================================")
print("Training completed successfully!")
print("===================================")

print("\nBest model:")
print(model_path)

print("\nFinal model:")
print(final_model_path)

print("\nClass names:")
print(class_names_path)