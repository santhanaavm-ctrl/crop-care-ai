import os
import hashlib
from PIL import Image
import numpy as np

def compute_dhash(image, hash_size=8):
    # Grayscale, resize to (hash_size + 1, hash_size)
    img = image.convert('L').resize((hash_size + 1, hash_size), Image.Resampling.LANCZOS)
    pixels = np.array(img, dtype=np.int32)
    diff = pixels[:, 1:] > pixels[:, :-1]
    # Pack into 64-bit integer
    return sum([2 ** i for (i, v) in enumerate(diff.flatten()) if v])

def compute_md5(file_path):
    hasher = hashlib.md5()
    with open(file_path, 'rb') as f:
        buf = f.read(65536)
        while len(buf) > 0:
            hasher.update(buf)
            buf = f.read(65536)
    return hasher.hexdigest()

def hamming_distance(h1, h2):
    return bin(h1 ^ h2).count('1')

def main():
    print("=================================================================")
    print("PLANTVILLAGE EXCLUSION & PROVENANCE DEDUPLICATION AUDIT")
    print("=================================================================")
    
    pv_base = 'ai/dataset'
    print(f"Indexing PlantVillage images in {pv_base}...")
    pv_md5_set = set()
    pv_dhashes = {} # dhash -> path
    
    pv_count = 0
    # Sample or index all splits
    for split in ['train', 'validation', 'test']:
        split_dir = os.path.join(pv_base, split)
        if not os.path.isdir(split_dir):
            continue
        for cls_name in os.listdir(split_dir):
            cp = os.path.join(split_dir, cls_name)
            if not os.path.isdir(cp):
                continue
            for img_name in os.listdir(cp):
                if not img_name.lower().endswith(('.jpg', '.jpeg', '.png')):
                    continue
                ip = os.path.join(cp, img_name)
                # Compute md5
                md5 = compute_md5(ip)
                pv_md5_set.add(md5)
                pv_count += 1
                
                # Sample dhashes for fast nearest neighbor
                if pv_count % 5 == 0:
                    try:
                        with Image.open(ip) as im:
                            dh = compute_dhash(im)
                            pv_dhashes[dh] = ip
                    except Exception:
                        pass
                
                if pv_count % 10000 == 0:
                    print(f"Indexed {pv_count} PlantVillage images...")

    print(f"Total PlantVillage images indexed: {pv_count}")
    print(f"PlantVillage perceptual hash dictionary entries: {len(pv_dhashes)}")

    # Audit PlantDoc against PlantVillage
    plantdoc_base = 'ai/external_datasets/plantdoc/PlantDoc-Dataset-master'
    print(f"\nChecking PlantDoc images in {plantdoc_base} against PlantVillage...")
    
    exact_matches = []
    near_duplicates = []
    clean_images = []
    
    pd_count = 0
    for split in ['train', 'test']:
        s_dir = os.path.join(plantdoc_base, split)
        if not os.path.isdir(s_dir):
            continue
        for cls_name in os.listdir(s_dir):
            cp = os.path.join(s_dir, cls_name)
            if not os.path.isdir(cp):
                continue
            for img_name in os.listdir(cp):
                if not img_name.lower().endswith(('.jpg', '.jpeg', '.png')):
                    continue
                ip = os.path.join(cp, img_name)
                pd_count += 1
                
                # Check MD5
                md5 = compute_md5(ip)
                if md5 in pv_md5_set:
                    exact_matches.append((ip, "MD5 exact match"))
                    continue
                
                # Check perceptual dhash
                try:
                    with Image.open(ip) as im:
                        im_dh = compute_dhash(im)
                        # Check distance against pv_dhashes
                        is_near = False
                        for pv_dh, pv_path in pv_dhashes.items():
                            dist = hamming_distance(im_dh, pv_dh)
                            if dist <= 2: # Very strict near-duplicate threshold
                                near_duplicates.append((ip, pv_path, dist))
                                is_near = True
                                break
                        if not is_near:
                            clean_images.append(ip)
                except Exception as e:
                    pass

    print("-" * 65)
    print("DEDUPLICATION & PROVENANCE FILTERING RESULTS:")
    print("-" * 65)
    print(f"Total PlantDoc Images Inspected  : {pd_count}")
    print(f"Exact PlantVillage Matches (MD5) : {len(exact_matches)}")
    print(f"Perceptual Near-Duplicates (<=2) : {len(near_duplicates)}")
    print(f"Verified In-The-Wild Field Images : {len(clean_images)}")
    if len(exact_matches) > 0:
        print("Sample exact matches:", exact_matches[:3])
    if len(near_duplicates) > 0:
        print("Sample near duplicates:", near_duplicates[:3])
    print("=" * 65)

if __name__ == '__main__':
    main()
