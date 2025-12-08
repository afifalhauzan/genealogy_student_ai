from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import kagglehub
from sklearn.preprocessing import StandardScaler
from scipy.cluster.hierarchy import dendrogram, linkage, set_link_color_palette
from kagglehub import KaggleDatasetAdapter
from pydantic import BaseModel
import io
import base64
import seaborn as sns
from matplotlib.lines import Line2D
from sklearn.cluster import AgglomerativeClustering

# Inisialisasi App
app = FastAPI()

# Setup CORS (Agar Frontend lokal bisa akses Backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. SETUP DATA ---
try:
    file_path = "student-scores.csv"
    df = kagglehub.load_dataset(
        KaggleDatasetAdapter.PANDAS,
        "mexwell/student-scores",
        file_path,
    )
    df = df.head(40).copy()
    print(f"Dataset berhasil dimuat! Menggunakan {len(df)} data sampel.")
except Exception as e:
    print(f"Gagal memuat dataset: {e}")
    # Fallback ke data dummy jika gagal download/load
    np.random.seed(42)
    data_dummy = {
        'math_score': np.random.randint(50, 100, 40),
        'history_score': np.random.randint(50, 100, 40),
        'physics_score': np.random.randint(50, 100, 40)
    }
    df = pd.DataFrame(data_dummy)
    print("Menggunakan data dummy sebagai fallback.")

# Schema Input dari Frontend
class StudentScore(BaseModel):
    math: int
    history: int
    physics: int

# --- 2. HELPER: DISTRIBUTION PLOTTER ---
def plot_score_distribution(data, user_value, subject_name, color):
    """
    Creates a distribution plot comparing the user to the class.
    """
    plt.switch_backend('Agg')
    fig, ax = plt.subplots(figsize=(8, 4)) # Compact size for dashboard feel
    
    # Plot class distribution (KDE + Histogram)
    sns.histplot(data, kde=True, ax=ax, color=color, alpha=0.6, label='Distribusi Kelas')
    
    # Plot User Line
    ax.axvline(user_value, color='red', linestyle='--', linewidth=2.5, label='ANDA')
    
    # Styling
    ax.set_title(f'Distribusi Performa: {subject_name}', fontsize=12, fontweight='bold')
    ax.set_xlabel('Nilai')
    ax.set_ylabel('Frekuensi')
    ax.legend()
    
    # Save
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    plt.close(fig)
    return base64.b64encode(buf.read()).decode('utf-8')

# --- 3. HELPER: INSIGHT ENGINE ---
def get_teacher_insights(user_scores, df_combined, clusters):
    scores = {
        'Math': user_scores.math,
        'History': user_scores.history,
        'Physics': user_scores.physics
    }

    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    strongest_subject = sorted_scores[0][0]
    weakest_subject = sorted_scores[-1][0]

    if strongest_subject == weakest_subject:
        weakest_subject = sorted_scores[1][0]

    gap = scores[strongest_subject] - scores[weakest_subject]

    # --- COPYWRITING BARU ---
    if gap > 30:
        profile = "The Specialist"
        desc = (
            f"Anda sangat unggul pada mata pelajaran {strongest_subject}, "
            f"namun masih perlu meningkatkan kemampuan di {weakest_subject}. "
            "Perbedaan kemampuan Anda cukup besar sehingga terlihat jelas kecenderungan belajar tertentu."
        )
    elif gap < 15:
        profile = "The Generalist"
        desc = (
            "Nilai Anda cukup merata di semua mata pelajaran. "
            "Ini menunjukkan bahwa Anda memiliki gaya belajar yang seimbang."
        )
    else:
        profile = "The Leaning Learner"
        desc = (
            f"Anda menunjukkan kecenderungan kuat pada mata pelajaran {strongest_subject}. "
            f"Tantangan terbesar Anda saat ini berada pada {weakest_subject}, "
            "tetapi hal ini masih bisa ditingkatkan dengan strategi belajar yang tepat."
        )

    # Strategi baru yang lebih mudah dipahami
    strategy = (
        f"Manfaatkan kekuatan Anda di mata pelajaran {strongest_subject} "
        f"untuk membantu memahami materi {weakest_subject}. "
        "Gunakan pola, logika, dan konsep yang Anda kuasai untuk mempercepat proses belajar."
    )

    # Peer Matching (copywriting baru)
    user_cluster = clusters[-1]
    candidates = df_combined.iloc[:-1].copy()
    candidates['cluster'] = clusters[:-1]
    candidates = candidates[candidates['cluster'] != user_cluster]

    if weakest_subject == 'Math':
        mentor = candidates.sort_values(by='math_score', ascending=False).iloc[0]
    elif weakest_subject == 'History':
        mentor = candidates.sort_values(by='history_score', ascending=False).iloc[0]
    else:
        mentor = candidates.sort_values(by='physics_score', ascending=False).iloc[0]

    peer_text = (
        f"Sistem merekomendasikan Anda untuk belajar bersama Student #{mentor.name} "
        f"karena ia memiliki kekuatan pada mata pelajaran {weakest_subject} "
        "dan bisa menjadi pendamping belajar yang efektif."
    )

    return {
        "profile": profile,
        "description": desc,
        "strategy": strategy,
        "recommended_peer": f"Student #{mentor.name}",
        "peer_reason": peer_text
    }

# --- 4. MAIN GENERATOR ---
def generate_student_dashboard(score: StudentScore, clusters, cluster_colors):
    # --- FIX 1: HANDLE MISSING ID COLUMN (NaN Fix) ---
    df_temp = df.copy()
    if 'id_siswa' not in df_temp.columns:
        df_temp['id_siswa'] = df_temp.index.astype(str)
    
    # A. Merge Data
    user_data = pd.DataFrame({
            'id_siswa': ['ANDA'], 
            'math_score': [score.math], 
            'history_score': [score.history], 
            'physics_score': [score.physics]
    })
    df_combined = pd.concat([df_temp, user_data], ignore_index=True)
    
    # --- NEW: GENERATE SMART LEGEND NAMES ---
    df_combined['cluster'] = np.append(clusters[:-1], clusters[-1])
    legend_labels = {}
    
    for c_id in np.unique(clusters):
        subset = df_combined[df_combined['cluster'] == c_id]
        mean_scores = subset[['math_score', 'history_score', 'physics_score']].mean()
        
        overall = mean_scores.mean()
        rng = mean_scores.max() - mean_scores.min()
        dom_subj = mean_scores.idxmax().replace('_score', '').capitalize()
        
        # Naming Logic
        if overall > 82:
            name = "Para Berprestasi Tinggi"
        elif overall < 60:
            name = "Grup Pendampingan"
        elif rng > 20:
            name = f"Spesialis {dom_subj}"
        else:
            name = f"Condong {dom_subj}"
            
        legend_labels[c_id] = name

    # B. Generate Visuals
    encoded_images = []
    
    # Histograms
    encoded_images.append(plot_score_distribution(df_combined['math_score'].iloc[:-1], score.math, 'Matematika', 'skyblue'))
    encoded_images.append(plot_score_distribution(df_combined['history_score'].iloc[:-1], score.history, 'Sejarah', 'lightgreen'))
    encoded_images.append(plot_score_distribution(df_combined['physics_score'].iloc[:-1], score.physics, 'Fisika', 'salmon'))

    # Dendrogram
    features = ['math_score', 'history_score', 'physics_score']
    X = df_combined[features]
    
    # Labels (Clean ID fix)
    labels = []
    for i, row in df_combined.iterrows():
        uid = str(row['id_siswa']).replace('.0', '') 
        avg = int(row[features].mean())
        labels.append(f"{uid} (Avg:{avg})")

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    linked = linkage(X_scaled, method='ward')

    custom_palette = ['#e41a1c', '#4daf4a', '#984ea3'] 
    set_link_color_palette(custom_palette)

    plt.switch_backend('Agg')
    fig_tree, ax_tree = plt.subplots(figsize=(12, 12))

    dendro = dendrogram(
        linked,
        labels=labels,
        leaf_rotation=0,
        leaf_font_size=10.,
        orientation='right',
        ax=ax_tree,
        color_threshold=6, 
        above_threshold_color='#999999'
    )

    # --- FIX 2: NO COLOR TEXT (Black Text Only) ---
    yticklabels = ax_tree.get_yticklabels()
    for label_obj in yticklabels:
        label_text = label_obj.get_text()
        
        # Highlight ONLY the user
        if 'ANDA' in label_text:
            label_obj.set_color('black')
            label_obj.set_backgroundcolor('yellow')
            label_obj.set_fontweight('bold')
            label_obj.set_fontsize(13)

    ax_tree.set_title('Pohon Silsilah Kognitif', fontsize=16, fontweight='bold')
    
    # --- LEGEND USING SMART NAMES ---
    legend_elements = []
    for c_id in legend_labels:
        color = custom_palette[c_id % len(custom_palette)]
        text = legend_labels[c_id]
        legend_elements.append(Line2D([0], [0], color=color, lw=4, label=text))
        
    legend_elements.append(Line2D([0], [0], marker='s', color='w', label='ANDA (Siswa Target)', markerfacecolor='black', markeredgecolor='black', markersize=10))
    ax_tree.legend(handles=legend_elements, loc='upper left')

    buf = io.BytesIO()
    fig_tree.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    plt.close(fig_tree)
    encoded_images.append(base64.b64encode(buf.read()).decode('utf-8'))

    insights = get_teacher_insights(score, df_combined, clusters)

    return encoded_images, insights

@app.get("/")
async def root():
    return {"message": "Backend AI Silsilah Siswa - Analitik Lanjutan"}

# --- 5. ENDPOINT UTAMA ---
@app.post("/api/generate-tree")
async def generate_tree(score: StudentScore):
    try:
        # 1. Combine Data first (We need the whole dataset to cluster)
        user_df = pd.DataFrame([{
            'id_siswa': 'ANDA', 
            'math_score': score.math, 
            'history_score': score.history, 
            'physics_score': score.physics
        }])

        # Fix: Ensure original dataframe has 'id_siswa' before merging
        df_temp = df.copy()
        if 'id_siswa' not in df_temp.columns:
            df_temp['id_siswa'] = df_temp.index.astype(str)

        df_combined = pd.concat([df_temp, user_df], ignore_index=True)

        # 2. Prepare & Scale Data
        features = ['math_score', 'history_score', 'physics_score']
        X = df_combined[features]
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # 3. Run the Algorithm (Agglomerative Clustering)
        cluster_model = AgglomerativeClustering(n_clusters=3, metric='euclidean', linkage='ward')
        actual_clusters = cluster_model.fit_predict(X_scaled)

        # 4. Generate Dashboard
        images, report = generate_student_dashboard(
            score,
            clusters=actual_clusters,
            cluster_colors={0: '#e41a1c', 1: '#4daf4a', 2: '#984ea3'}
        )

        return {
            "status": "success", 
            "images": images,  # [math_hist, history_hist, physics_hist, dendrogram]
            "insights": report
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))