import os
import sys
import json
import logging

# Use PyTorch backend for Keras 3 to run natively on Windows without Smart App Control blockers
os.environ["KERAS_BACKEND"] = "torch"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

import numpy as np
import keras
from PIL import Image

# ==========================================
# Paths
# ==========================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "plant_disease_model.keras"
)

CLASS_NAMES_PATH = os.path.join(
    BASE_DIR,
    "models",
    "class_names.json"
)

# ==========================================
# Comprehensive Agronomic Advisory Database
# ==========================================

ADVISORY_DATABASE = {
    # Apple
    "Apple___Apple_scab": {
        "symptoms": "Olive-green, velvety spots on leaves that turn dark brown or black with age. Premature leaf drop and scabby fruit lesions.",
        "action": "Prune infected branches to increase canopy airflow. If infection is active, apply an approved protective fungicide (e.g., captan or sulfur-based spray) during early morning.",
        "prevention": "Rake and destroy fallen leaves in autumn to disrupt Venturia inaequalis pseudothecia wintering. Space trees properly to promote rapid leaf drying.",
        "care": "Avoid overhead sprinkler irrigation. Maintain balanced potassium to reinforce leaf cuticle integrity.",
        "nextSteps": "Inspect surrounding apple trees for similar circular velvety lesions, especially lower canopy leaves."
    },
    "Apple___Black_rot": {
        "symptoms": "Frogeye leaf spots with purple margins and light brown or tan centers. Fruit develops dark, sunken, rotting rings.",
        "action": "Prune out dead wood, fire blight cankers, and mummified fruit remaining in the orchard. Burn or bury infected tissues away from trees.",
        "prevention": "Sterilize pruning tools with 70% alcohol between cuts. Prune annually to maintain open center canopy aeration.",
        "care": "Ensure adequate soil drainage. Avoid tree bark injuries from mowers or field equipment.",
        "nextSteps": "Scout fruit clusters and trunk limbs for expanding dark cankers or fungal fruiting pycnidia."
    },
    "Apple___Cedar_apple_rust": {
        "symptoms": "Bright yellow-orange or reddish circular spots on upper leaf surfaces. Orange tubular aecia cups appear on leaf undersides in mid-summer.",
        "action": "Remove nearby eastern red cedar or juniper trees within 1-2 miles if feasible, as they are essential alternate hosts.",
        "prevention": "Plant resistant apple varieties (e.g., Enterprise, Liberty). Apply preventative sterol-inhibiting or protective fungicides when cedar galls swell in spring.",
        "care": "Maintain balanced nitrogen levels; excessive lush vegetative growth is more susceptible to rust penetration.",
        "nextSteps": "Check nearby conifers for gelatinous orange rust horns (teliohorns) following rain."
    },
    "Apple___healthy": {
        "symptoms": "Uniform green foliage, intact margins, well-developed leaf cuticle without discoloration or necrotic lesions.",
        "action": "No chemical or disease treatment needed. Foliage is vigorous and healthy.",
        "prevention": "Continue standard seasonal preventative monitoring. Maintain balanced orchard sanitation.",
        "care": "Ensure regular drip irrigation and conduct routine spring pruning for canopy light interception.",
        "nextSteps": "Record healthy scan in history to establish baseline orchard vigor."
    },

    # Blueberry
    "Blueberry___healthy": {
        "symptoms": "Glossy green leaves, vibrant stems, absence of chlorosis or leaf spot lesions.",
        "action": "No treatment required. Plant exhibits strong photosynthetic vigor.",
        "prevention": "Maintain soil pH between 4.5 and 5.2. Apply pine bark or acidic mulch to suppress weeds and retain soil moisture.",
        "care": "Use drip irrigation with acidic water source. Avoid ammonium nitrate fertilizers that shift soil alkaline.",
        "nextSteps": "Monitor new spring shoot flushes for aphid or scale vectors."
    },

    # Cherry
    "Cherry_(including_sour)___Powdery_mildew": {
        "symptoms": "White, talcum-like powdery fungal patches on young leaves and terminal shoots. Leaves curl upwards and distort.",
        "action": "Prune densely foliated interior shoots to enhance sunlight and wind drying. Apply horticultural oil or potassium bicarbonate at first sign of white mildew.",
        "prevention": "Avoid planting cherry trees in low-lying, humid frost pockets. Water at base to keep foliage dry.",
        "care": "Prune during dormant season to eliminate infected shoot tips. Limit late summer nitrogen applications.",
        "nextSteps": "Inspect terminal growing tips weekly; powdery mildew favors dry leaves under high ambient relative humidity."
    },
    "Cherry_(including_sour)___healthy": {
        "symptoms": "Deep green foliage, robust leaf expansion, no curling or fungal mycelium.",
        "action": "No disease intervention required.",
        "prevention": "Prune annually to maintain an open canopy. Monitor for cherry fruit flies and mites.",
        "care": "Provide deep root irrigation during fruit development and apply balanced organic compost.",
        "nextSteps": "Continue routine orchard scouting."
    },

    # Corn (Maize)
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": {
        "symptoms": "Rectangular, tan-to-gray leaf spots strictly delimited by parallel leaf veins. Lesions merge to cause extensive leaf blighting.",
        "action": "Apply an approved triazole or strobilurin foliar fungicide if lesions appear on the ear leaf before tasseling in high-yield fields.",
        "prevention": "Rotate out of corn for 1-2 seasons to allow residue decomposition. Practice conservation tillage to bury infected crop residue.",
        "care": "Select certified gray leaf spot resistant hybrid seed. Balance nitrogen application to avoid plant lodging.",
        "nextSteps": "Evaluate disease progress upward from bottom leaves toward the critical ear leaf."
    },
    "Corn_(maize)___Common_rust_": {
        "symptoms": "Small, oval-to-elongate cinnamon-brown pustules (uredinia) scattered across both upper and lower leaf surfaces.",
        "action": "Foliar fungicide application is warranted only if pustules appear before silking on susceptible inbred lines or sweet corn varieties.",
        "prevention": "Plant resistant hybrid corn cultivars with specific Rp resistance genes.",
        "care": "Avoid excessive plant populations that increase microclimate humidity. Ensure balanced fertilization.",
        "nextSteps": "Monitor weather: cool temperatures (16-25°C) and high humidity favor rapid rust spread."
    },
    "Corn_(maize)___Northern_Leaf_Blight": {
        "symptoms": "Long, elliptical, grayish-green or tan cigar-shaped lesions (2-15 cm) running along leaf blades.",
        "action": "Apply targeted foliar fungicides if lesions reach leaves below the ear leaf during early tasseling.",
        "prevention": "Rotate crops with non-grasses (soybean, legumes). Plow under corn stubble in fields with severe previous outbreaks.",
        "care": "Utilize hybrid corn cultivars possessing multi-gene or Ht resistance.",
        "nextSteps": "Scout canopy following extended rainy periods."
    },
    "Corn_(maize)___healthy": {
        "symptoms": "Sturdy green blades, strong stalk development, absence of foliar pustules or cigar lesions.",
        "action": "No corrective treatment needed.",
        "prevention": "Implement standard field scouting and insect monitoring (fall armyworm, stem borer).",
        "care": "Maintain optimal sidedress nitrogen and ensure adequate soil moisture during silking and tasseling.",
        "nextSteps": "Document crop stage and monitor soil moisture."
    },

    # Grape
    "Grape___Black_rot": {
        "symptoms": "Small, circular reddish-brown leaf spots with dark borders containing tiny black specks (pycnidia). Berries shrivel into hard, black mummies.",
        "action": "Strip and destroy mummified berry clusters and infected leaves from vines and vineyard floor. Apply protective myclobutanil or copper-based sprays from bud break through veraison.",
        "prevention": "Canopy shoot positioning and leaf pulling around fruit zones to maximize sunlight exposure and air circulation.",
        "care": "Ensure vineyard rows are oriented with prevailing winds to promote rapid leaf drying.",
        "nextSteps": "Examine fruit clusters immediately; early protection prevents complete bunch mummification."
    },
    "Grape___Esca_(Black_Measles)": {
        "symptoms": "Tiger-stripe interveinal chlorosis and necrosis on foliage. Berries develop small, dark purple or black speckles ('measles').",
        "action": "No chemical cure exists for systemic vascular esca. Mark affected vines; prune dead cordons back to healthy white wood during dry dormant periods.",
        "prevention": "Protect pruning wounds with wound sealants containing fungicidal paste or Trichoderma biocontrol.",
        "care": "Reduce vine stress through proper irrigation and avoid heavy crop loads on weakened vines.",
        "nextSteps": "Inspect vine trunks for spongy, decayed white rot wood."
    },
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
        "symptoms": "Irregular, dark brown angular necrotic spots on leaves with faint yellow halos, causing premature defoliation.",
        "action": "Apply protective copper or mancozeb foliar sprays after petal fall if defoliation is threatened.",
        "prevention": "Remove fallen diseased leaves post-harvest. Practice rigorous winter canopy pruning.",
        "care": "Ensure adequate trellis spacing to prevent dense, trapped moisture canopies.",
        "nextSteps": "Check lower vine canopy where humidity remains highest."
    },
    "Grape___healthy": {
        "symptoms": "Uniform emerald-green leaves with crisp margins and active tendril elongation.",
        "action": "No treatment required.",
        "prevention": "Maintain routine vineyard scouting and shoot thinning for canopy aeration.",
        "care": "Irrigate according to vine water status and avoid excessive late nitrogen.",
        "nextSteps": "Record scan baseline."
    },

    # Orange (Citrus)
    "Orange___Haunglongbing_(Citrus_greening)": {
        "symptoms": "Asymmetric blotchy mottle chlorosis across leaf veins (one side yellow, other side green). Lopsided, bitter fruit with dark aborted seeds.",
        "action": "HLB is an incurable bacterial disease (Candidatus Liberibacter asiaticus) vectored by Asian citrus psyllids. Remove infected trees promptly to prevent orchard-wide transmission.",
        "prevention": "Aggressively monitor and manage Asian citrus psyllid vectors using systemic neonicotinoid or targeted organic treatments. Plant only certified disease-free nursery stock.",
        "care": "Apply foliar micronutrient sprays (zinc, manganese, boron) to support vitality of non-symptomatic trees.",
        "nextSteps": "Inspect new shoot flushes for psyllid nymphs feeding at 45-degree angles."
    },

    # Peach
    "Peach___Bacterial_spot": {
        "symptoms": "Small, water-soaked polygonal leaf lesions that turn purple-brown and drop out, creating a 'shot-hole' appearance. Pitted fruit cracks.",
        "action": "Apply preventive copper sprays during dormant season and early spring bud swell. During growing season, use low-dose oxytetracycline or copper under dry conditions.",
        "prevention": "Avoid high-pressure overhead irrigation that splashes Xanthomonas bacteria. Plant resistant peach cultivars in sandy soils.",
        "care": "Provide balanced fertilization; avoid excessive nitrogen that promotes tender, easily infected shoots.",
        "nextSteps": "Inspect fruit surface for gum exudation or cracking."
    },
    "Peach___healthy": {
        "symptoms": "Vibrant lanceolate green leaves without shot-holes or curling.",
        "action": "No disease treatment indicated.",
        "prevention": "Maintain dormant copper sprays against peach leaf curl.",
        "care": "Thin fruit load to optimize fruit size and prune to open-vase structure.",
        "nextSteps": "Continue routine orchard scouting."
    },

    # Pepper (Bell)
    "Pepper,_bell___Bacterial_spot": {
        "symptoms": "Small, circular to irregular water-soaked spots on leaf undersides, becoming dark brown with greasy margins. Leaves yellow and drop rapidly.",
        "action": "Apply copper bactericide combined with mancozeb, or use a certified Bacillus subtilis biological treatment. Do not work in wet fields.",
        "prevention": "Use certified pathogen-free seed or hot-water treated seeds. Practice a 2-3 year crop rotation with non-solanaceous crops.",
        "care": "Use drip irrigation instead of overhead sprinklers to eliminate leaf surface wetness.",
        "nextSteps": "Isolate affected garden bed and disinfect greenhouse benches and stakes."
    },
    "Pepper,_bell___healthy": {
        "symptoms": "Glossy, uniform green leaves with sturdy stem nodes and normal flower development.",
        "action": "No corrective treatment needed.",
        "prevention": "Maintain insect netting to exclude thrips and aphids.",
        "care": "Maintain steady soil moisture to prevent blossom end rot (calcium deficiency).",
        "nextSteps": "Record crop health baseline."
    },

    # Potato
    "Potato___Early_blight": {
        "symptoms": "Concentric ring 'target-board' brown-to-black spots on older leaves, surrounded by yellow chlorotic margins.",
        "action": "Apply an approved protectant fungicide (chlorothalonil, mancozeb, or azoxystrobin) at first sign of lower leaf lesions.",
        "prevention": "Practice a 3-4 year crop rotation away from solanaceous species. Destroy volunteer potatoes and eliminate nightshade weeds.",
        "care": "Maintain optimal nitrogen and potassium nutrition. Avoid water stress, as stressed plants are highly susceptible.",
        "nextSteps": "Inspect the lowest leaves in the canopy where disease begins."
    },
    "Potato___Late_blight": {
        "symptoms": "Large, irregular water-soaked pale green or dark brown lesions. A delicate white fuzzy fungal growth appears on leaf undersides during humid weather.",
        "action": "CRITICAL EMERGENCY: Apply systemic and contact late blight fungicides (e.g., cymoxanil, mandipropamid) immediately. Destroy severely blighted hills.",
        "prevention": "Plant certified disease-free seed tubers. Eliminate cull piles where Phytophthora infestans overwinters.",
        "care": "Hill tubers well with soil to prevent sporangia from washing into developing tubers. Avoid overhead irrigation.",
        "nextSteps": "Alert regional agricultural extension; late blight can spread across entire farming valleys within days."
    },
    "Potato___healthy": {
        "symptoms": "Full, lush green foliage with uniform leaf lobes and robust branching.",
        "action": "No disease treatment required.",
        "prevention": "Scout fields twice weekly during cool, moist weather.",
        "care": "Maintain consistent hilling and drip irrigation schedules.",
        "nextSteps": "Record diagnostic baseline."
    },

    # Raspberry
    "Raspberry___healthy": {
        "symptoms": "Vibrant serrated green leaflets without leaf spot chlorosis or cane lesions.",
        "action": "No disease intervention needed.",
        "prevention": "Prune out spent floricanes after fruiting to improve airflow around primocanes.",
        "care": "Trellis canes upright and apply organic mulch to preserve root moisture.",
        "nextSteps": "Check cane bases for signs of spur blight or cane borer insects."
    },

    # Soybean
    "Soybean___healthy": {
        "symptoms": "Trifoliate leaves exhibiting uniform green coloration without rust pustules or bacterial blighting.",
        "action": "No treatment required.",
        "prevention": "Rotate crops with non-host grasses (corn, wheat). Use certified treated seed.",
        "care": "Ensure adequate soil phosphorus and potassium; inoculate seed with Rhizobium for optimal nodulation.",
        "nextSteps": "Monitor canopy during pod-fill stage for defoliating caterpillars."
    },

    # Squash
    "Squash___Powdery_mildew": {
        "symptoms": "White powdery talcum-like fungal spots on upper and lower surfaces of leaves and petioles. Leaves turn yellow, brown, and brittle.",
        "action": "Apply sulfur, potassium bicarbonate, or neem oil at first sign of powdery spots. In commercial fields, apply systemic powdery mildew fungicides.",
        "prevention": "Plant resistant squash varieties. Space plants widely to promote canopy airflow and direct sunlight.",
        "care": "Irrigate at ground level using drip tape. Avoid overhead watering in late afternoon.",
        "nextSteps": "Inspect underside of dense inner leaves where powdery mildew colonies first establish."
    },

    # Strawberry
    "Strawberry___Leaf_scorch": {
        "symptoms": "Numerous small, irregular purple-to-brown spots on upper leaf surfaces. As spots enlarge, they scorch the leaf margins, causing whole leaves to curl and dry.",
        "action": "Remove and destroy severely affected leaves after harvest. Apply an approved protective fungicide (e.g., captan or copper) during new leaf emergence.",
        "prevention": "Plant certified disease-free runner plants. Renovate strawberry beds after harvest by mowing foliage and removing dead leaves.",
        "care": "Use drip irrigation to prevent splash dispersal of Diplocarpon earlianum conidia. Avoid excessive nitrogen that promotes dense foliage.",
        "nextSteps": "Examine leaf petioles and runner stolons for purple sunken lesions."
    },
    "Strawberry___healthy": {
        "symptoms": "Glossy trifoliate green leaves with crisp toothed margins and vigorous crown development.",
        "action": "No disease treatment needed.",
        "prevention": "Apply clean straw mulch to keep leaves and fruit off bare soil.",
        "care": "Maintain balanced moisture during flowering and runner development.",
        "nextSteps": "Monitor runners and record baseline."
    },

    # Tomato
    "Tomato___Bacterial_spot": {
        "symptoms": "Small, circular greasy water-soaked spots (1-3 mm) turning dark brown or black with yellow halos. Leaves yellow, wither, and drop.",
        "action": "Apply copper hydroxide mixed with mancozeb or a registered bacteriophage product. Avoid touching or cultivating wet plants.",
        "prevention": "Use certified disease-free seed and transplants. Implement a 2-3 year crop rotation with non-solanaceous crops.",
        "care": "Water via drip irrigation at soil level. Stake and prune suckers to improve canopy airflow.",
        "nextSteps": "Disinfect garden stakes, pruning shears, and cages with 10% bleach or 70% alcohol."
    },
    "Tomato___Early_blight": {
        "symptoms": "Brown-to-black spots with characteristic concentric rings ('bullseye' pattern) on older lower leaves. Surrounding tissue turns yellow.",
        "action": "Prune out infected lower foliage up to 30 cm above soil level. Apply an approved fungicide (chlorothalonil, copper, or biofungicide) to prevent upward progression.",
        "prevention": "Mulch soil around plants to prevent Alternaria solani fungal spores from splashing onto lower leaves from the soil.",
        "care": "Ensure adequate plant spacing (at least 60 cm). Maintain balanced potassium and avoid nitrogen deficiency.",
        "nextSteps": "Monitor lower leaves weekly; early removal prevents canopy loss before harvest."
    },
    "Tomato___Late_blight": {
        "symptoms": "Large, irregular water-soaked grayish-green lesions that rapidly turn dark brown. Fluffy white fungal mycelium appears on leaf undersides in high humidity.",
        "action": "CRITICAL EMERGENCY: Apply systemic late blight fungicides (e.g., dimethomorph, mandipropamid) immediately. Remove and bag severely diseased plants.",
        "prevention": "Eliminate nearby volunteer potatoes and solanaceous weeds. Choose resistant tomato varieties (e.g., Mountain Magic, Defiant).",
        "care": "Strictly avoid overhead irrigation. Maximize airflow with wide row spacing and rigorous staking.",
        "nextSteps": "Inspect stems and green fruit for greasy brown lesions."
    },
    "Tomato___Leaf_Mold": {
        "symptoms": "Pale greenish-yellow chlorotic spots on upper leaf surfaces. Olive-green to brown velvety mold growth develops on corresponding undersides.",
        "action": "Improve greenhouse/field ventilation. Apply copper-based or bio-fungicide sprays to coat leaf undersides thoroughly.",
        "prevention": "Reduce greenhouse relative humidity below 85% by opening side vents and running circulation fans.",
        "care": "Prune lower leaves to allow air movement through the center of the canopy.",
        "nextSteps": "Check humidity levels in covered or greenhouse structures."
    },
    "Tomato___Septoria_leaf_spot": {
        "symptoms": "Numerous small circular spots (2-4 mm) with dark brown margins and sunken grayish-white centers dotted with tiny black fruiting bodies.",
        "action": "Remove affected lower leaves. Apply protective fungicides (chlorothalonil or copper) beginning at first bloom.",
        "prevention": "Practice 3-year crop rotation. Apply clean straw or plastic mulch to create a physical barrier between soil and leaves.",
        "care": "Water at base of plants using drip irrigation. Space plants 60-90 cm apart for rapid air drying.",
        "nextSteps": "Inspect lower canopy where Septoria starts before spreading upward."
    },
    "Tomato___Spider_mites Two-spotted_spider_mite": {
        "symptoms": "Fine yellow or white stippling on upper leaf surfaces. Fine silken webbing on leaf undersides. Severe infestation causes leaves to bronzen and dry.",
        "action": "Apply insecticidal soap, horticultural oil, or targeted miticide. Release predatory mites (Phytoseiulus persimilis) in organic or greenhouse setups.",
        "prevention": "Keep plants well-irrigated; drought stress promotes rapid spider mite population explosions. Wash plant dust off field borders.",
        "care": "Spray leaf undersides thoroughly, as mites congregate near leaf veins.",
        "nextSteps": "Use a 10x hand lens on leaf undersides to verify active mite movement and web colonies."
    },
    "Tomato___Target_Spot": {
        "symptoms": "Small brown circular lesions with subtle concentric rings and yellow halos. Lesions can coalesce to cause extensive leaf blight.",
        "action": "Apply targeted fungicides (azoxystrobin, chlorothalonil, or copper) and prune diseased foliage.",
        "prevention": "Maintain wide plant spacing. Destroy volunteer tomatoes and crop residue after harvest.",
        "care": "Stake plants and avoid overhead watering that splashes Corynespora cassiicola spores.",
        "nextSteps": "Check developing fruit for sunken brown target lesions."
    },
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "symptoms": "Severe plant stunting, erect growth habit, cupping/curling of leaves upward, and bright interveinal yellowing (chlorosis).",
        "action": "TYLCV is a viral disease vectored by silverleaf whiteflies. Rogue and destroy infected plants immediately to prevent whitefly transmission to healthy plants.",
        "prevention": "Control whitefly vectors using yellow sticky cards, insecticidal soaps, or systemic insecticides. Install 50-mesh insect screening on greenhouse vents.",
        "care": "Plant certified TYLCV-resistant tomato hybrids (e.g., Tygress, Skyway).",
        "nextSteps": "Inspect leaf undersides for tiny whiteflies fluttering when shaken."
    },
    "Tomato___Tomato_mosaic_virus": {
        "symptoms": "Light and dark green mosaic or mottled leaf patterns, leaf distortion ('shoestring' appearance), and internal brown browning of fruit walls.",
        "action": "No chemical cure exists for viral mosaic. Rogue and burn infected plants. Wash hands and tools with dairy milk or trisodium phosphate.",
        "prevention": "Do not smoke or use tobacco products near tomatoes, as tobacco mosaic virus spreads via touch. Plant virus-resistant varieties (labeled 'VFN' or 'TMV').",
        "care": "Disinfect trellises, ties, and pruning shears between plants.",
        "nextSteps": "Quarantine the affected greenhouse section to prevent mechanical transmission."
    },
    "Tomato___healthy": {
        "symptoms": "Deep green compound leaves, robust stems, strong flowering clusters, absence of leaf spots or curling.",
        "action": "No corrective treatment needed. Plant exhibits strong photosynthetic vigor.",
        "prevention": "Maintain consistent scouting and regular preventative pruning of bottom suckers.",
        "care": "Ensure consistent soil moisture (2-3 cm water weekly) and apply balanced 5-10-10 or organic tomato fertilizer.",
        "nextSteps": "Record crop diagnostic baseline."
    }
}

# ==========================================
# Prediction Pipeline Implementation
# ==========================================

def parse_class_label(class_name):
    if "___" in class_name:
        crop_part, disease_part = class_name.split("___", 1)
    else:
        crop_part = class_name
        disease_part = "Condition detected"

    clean_crop = (
        crop_part.replace("_", " ")
        .replace("(", "")
        .replace(")", "")
        .strip()
        .title()
    )

    clean_disease = (
        disease_part.replace("_", " ")
        .strip()
        .title()
    )

    if clean_disease.lower() == "healthy":
        clean_disease = "Healthy"

    return clean_crop, clean_disease

def get_advisory(class_name, clean_crop, clean_disease):
    if class_name in ADVISORY_DATABASE:
        return ADVISORY_DATABASE[class_name]

    if "healthy" in class_name.lower():
        return {
            "symptoms": f"Uniform healthy foliage without visible chlorosis or lesions on {clean_crop}.",
            "action": "No disease-specific treatment is indicated by this prediction.",
            "prevention": f"Continue standard preventative monitoring of {clean_crop} plants.",
            "care": "Maintain suitable irrigation and balanced crop nutrition.",
            "nextSteps": f"Record {clean_crop} baseline status."
        }

    return {
        "symptoms": f"Visible discoloration or foliar symptoms consistent with {clean_disease} on {clean_crop}.",
        "action": (
            f"The model predicts {clean_disease} in {clean_crop}. "
            "Inspect the plant and confirm the diagnosis with a local "
            "agricultural extension officer before applying commercial chemical treatments."
        ),
        "prevention": (
            "Use clean certified planting material, monitor the crop regularly, "
            "and remove infected plant debris where appropriate."
        ),
        "care": (
            "Maintain appropriate irrigation, plant spacing, "
            "and airflow around the foliage."
        ),
        "nextSteps": "Isolate the plant and monitor surrounding foliage for symptom progression."
    }

def main():
    try:
        # Check command-line arguments
        if len(sys.argv) < 2:
            raise ValueError("Image path argument is required.")

        image_path = os.path.abspath(sys.argv[1])

        # Verify required files
        if not os.path.isfile(MODEL_PATH):
            raise FileNotFoundError(f"AI model not found: {MODEL_PATH}")

        if not os.path.isfile(CLASS_NAMES_PATH):
            raise FileNotFoundError(f"Class names file not found: {CLASS_NAMES_PATH}")

        if not os.path.isfile(image_path):
            raise FileNotFoundError(f"Image file not found: {image_path}")

        # 1. Image Validation & Out-of-Distribution / Quality Inspection
        try:
            pil_image = Image.open(image_path)
            pil_image.verify()
            pil_image = Image.open(image_path).convert("RGB")
        except Exception as img_err:
            print(json.dumps({
                "success": False,
                "status": "UNSUPPORTED",
                "message": f"Invalid or unreadable image file: {str(img_err)}"
            }))
            sys.exit(0)

        w, h = pil_image.size
        if w < 50 or h < 50:
            print(json.dumps({
                "success": False,
                "status": "UNSUPPORTED",
                "message": "Image resolution is too low for reliable diagnostic analysis (minimum 50x50 pixels required)."
            }))
            sys.exit(0)

        img_np = np.array(pil_image, dtype=np.float32)
        std_dev = float(np.std(img_np))
        if std_dev < 14.0:
            print(json.dumps({
                "success": False,
                "status": "UNSUPPORTED",
                "message": "The uploaded photograph lacks sufficient contrast or visual texture. Please upload a clear, focused photo of a crop leaf."
            }))
            sys.exit(0)

        # Check for near-monochrome or non-plant extreme distributions
        r_channel, g_channel, b_channel = img_np[:, :, 0], img_np[:, :, 1], img_np[:, :, 2]
        color_diff = float(np.mean(np.abs(r_channel - g_channel)) + np.mean(np.abs(g_channel - b_channel)))
        mean_lum = float(np.mean(img_np))
        if color_diff < 5.0 and (mean_lum > 235 or mean_lum < 20):
            print(json.dumps({
                "success": False,
                "status": "UNSUPPORTED",
                "message": "The uploaded photograph does not appear to contain a recognizable plant leaf. Please upload a clear photo of crop foliage."
            }))
            sys.exit(0)

        # 2. Load Class Names and Build Species Mapping
        with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as file:
            class_names = json.load(file)

        species_list = sorted(list(set([c.split("___")[0] for c in class_names])))
        species_to_classes = {sp: [i for i, c in enumerate(class_names) if c.startswith(sp + "___")] for sp in species_list}
        class_to_species = {i: c.split("___")[0] for i, c in enumerate(class_names)}

        # 3. Load Trained Model via Keras with PyTorch Backend
        model = keras.models.load_model(MODEL_PATH, compile=False)

        # 4. Preprocessing: Resize to 224x224 RGB, float32 in [0, 255]
        # (Normalization is handled internally by model layers)
        resized_img = pil_image.resize((224, 224))
        image_batch = np.expand_dims(np.array(resized_img, dtype=np.float32), axis=0)

        # 5. Model Inference
        raw_predictions = model.predict(image_batch, verbose=0)[0]

        if len(raw_predictions) != len(class_names):
            raise ValueError(
                f"Model output has {len(raw_predictions)} classes, but class_names.json contains {len(class_names)}."
            )

        # 6. Temperature Scaling Probability Calibration (T = 1.20)
        temperature = 1.20
        epsilon = 1e-7
        clipped_probs = np.clip(raw_predictions, epsilon, 1.0 - epsilon)
        logits = np.log(clipped_probs)
        scaled_logits = logits / temperature
        exp_logits = np.exp(scaled_logits - np.max(scaled_logits))
        calibrated_probs = exp_logits / np.sum(exp_logits)

        # 7. Two-Stage Hierarchical Plant Species Verification
        species_probs = {}
        for sp, class_indices in species_to_classes.items():
            species_probs[sp] = float(np.sum(calibrated_probs[class_indices]))

        top_species_name, top_species_prob = max(species_probs.items(), key=lambda x: x[1])

        # Primary disease prediction
        predicted_index = int(np.argmax(calibrated_probs))
        predicted_class = class_names[predicted_index]
        disease_species = class_to_species[predicted_index]
        calibrated_conf = float(calibrated_probs[predicted_index])

        clean_crop, clean_disease = parse_class_label(predicted_class)
        clean_top_species, _ = parse_class_label(f"{top_species_name}___healthy")

        # Top 3 Candidates
        top3_indices = np.argsort(calibrated_probs)[::-1][:3]
        top_candidates = []
        for idx in top3_indices:
            c_crop, c_dis = parse_class_label(class_names[idx])
            top_candidates.append({
                "class": class_names[idx],
                "crop": c_crop,
                "disease": c_dis,
                "confidence": round(float(calibrated_probs[idx]) * 100, 2)
            })

        # 8. Honest Confidence & Diagnostic Decision Logic
        # Case A: Species Mismatch
        if disease_species != top_species_name:
            status = "UNCERTAIN"
            status_message = (
                f"Prediction uncertain. Visual features show conflicting species characteristics "
                f"between {clean_crop} and {clean_top_species}. Please upload a clearer image of a single leaf."
            )
        # Case B: Low Probability (< 48% disease confidence or < 60% species confidence)
        elif calibrated_conf < 0.48 or top_species_prob < 0.60:
            status = "UNCERTAIN"
            status_message = (
                "Prediction uncertain. The model confidence is below the reliable diagnostic threshold. "
                "Please upload a clearer, well-lit image focusing directly on the leaf."
            )
        # Case C: High Confidence
        else:
            status = "HIGH CONFIDENCE"
            status_message = f"High confidence diagnosis for {clean_crop}."

        advisory = get_advisory(predicted_class, clean_crop, clean_disease)

        result = {
            "success": True,
            "status": status,
            "statusMessage": status_message,
            "prediction": predicted_class,
            "crop": clean_crop,
            "disease": clean_disease,
            "confidence": round(calibrated_conf * 100, 2),
            "speciesConfidence": round(top_species_prob * 100, 2),
            "topCandidates": top_candidates,
            "speciesAnalysis": {
                parse_class_label(f"{sp}___healthy")[0]: round(prob * 100, 2)
                for sp, prob in sorted(species_probs.items(), key=lambda x: x[1], reverse=True)[:3]
            },
            "recommendation": advisory,
            "symptoms": advisory.get("symptoms", ""),
            "nextSteps": advisory.get("nextSteps", ""),
            "disclaimer": (
                "AI-assisted diagnosis should be confirmed with a local agricultural extension specialist "
                "or agronomist prior to applying commercial chemical treatments."
            )
        }

        print(json.dumps(result))

    except Exception as error:
        print(json.dumps({
            "success": False,
            "status": "ERROR",
            "message": str(error)
        }))
        sys.exit(1)


if __name__ == "__main__":
    main()