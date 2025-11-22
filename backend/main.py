from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import kagglehub
from kagglehub import KaggleDatasetAdapter

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
from scipy.cluster.hierarchy import dendrogram, linkage

import io
import base64
from pydantic import BaseModel

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

try:
    file_path = "student-scores.csv"
    df_full = kagglehub.load_dataset(
      KaggleDatasetAdapter.PANDAS,
      "mexwell/student-scores",
      file_path,
    )
    # Ambil sampel 40 data agar dendrogram tidak terlalu padat
    # Kita reset index agar ID siswa urut dari 0-39
    df_db = df_full.head(40).copy().reset_index(drop=True)
    
    # Buat ID Siswa Dummy (S001, S002, dst) untuk label di grafik
    df_db['id_siswa'] = [f'S{i:03d}' for i in range(len(df_db))]
    
    print(f"Dataset berhasil dimuat! Menggunakan {len(df_db)} data sampel.")
    
except Exception as e:
    print(f"Gagal memuat dataset: {e}")
    # Fallback ke data dummy jika gagal download/load
    np.random.seed(42)
    data_dummy = {
        'id_siswa': [f'S{i:03d}' for i in range(1, 41)],
        'math_score': np.random.randint(50, 100, 40),
        'history_score': np.random.randint(50, 100, 40),
        'physics_score': np.random.randint(50, 100, 40)
    }
    df_db = pd.DataFrame(data_dummy)
    print("Menggunakan data dummy sebagai fallback.")

# Schema Input dari Frontend
class StudentScore(BaseModel):
    math: int
    history: int
    physics: int

@app.get("/")
async def root():
    return {"message": "Hello World"}

# --- 2. ENDPOINT UTAMA ---
@app.post("/api/generate-tree")
async def generate_tree(score: StudentScore):
    try:
        # A. Preprocessing & Merge Data
        # Siapkan data user
        user_data = pd.DataFrame({
            'id_siswa': ['ANDA'],
            'math_score': [score.math],
            'history_score': [score.history],
            'physics_score': [score.physics]
        })
        
        # Gabungkan dataset lama dengan data user baru
        # Penting: Kita ambil kolom yang sama saja
        features = ['math_score', 'history_score', 'physics_score']
        
        # Pastikan df_db punya kolom yang sesuai (kadang nama kolom beda di CSV asli)
        # Di dataset mexwell/student-scores, nama kolomnya biasanya lowercase dengan underscore
        # Kita asumsikan nama kolom sudah sesuai. Jika tidak, perlu rename.
        
        # Menggabungkan data (hanya kolom fitur yang relevan)
        X_existing = df_db[features]
        X_user = user_data[features]
        X = pd.concat([X_existing, X_user], ignore_index=True)
        
        # Siapkan label untuk dendrogram (ID Siswa + 'ANDA')
        labels = list(df_db['id_siswa'].values) + ['ANDA']
        
        # Scaling (Wajib untuk Euclidean Distance)
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # B. Hierarchical Clustering Algorithm
        # method='ward' meminimalkan varians dalam cluster (standar yang bagus)
        linked = linkage(X_scaled, method='ward')
        
        # C. Plotting Dendrogram
        # Gunakan backend 'Agg' agar tidak perlu GUI window
        plt.switch_backend('Agg') 
        plt.figure(figsize=(12, 7))
        plt.title('Peta Silsilah Gaya Belajar (Posisi Anda)', fontsize=16)
        plt.xlabel('Siswa (ID)', fontsize=12)
        plt.ylabel('Jarak Ketidakmiripan (Euclidean)', fontsize=12)
        
        dendro = dendrogram(
            linked,
            labels=labels,
            leaf_rotation=90.,
            leaf_font_size=10.,
            show_contracted=True
        )
        
        # Trik Visual: Highlight Label 'ANDA' menjadi Merah & Bold
        ax = plt.gca()
        x_labels = ax.get_xticklabels()
        for label in x_labels:
            if label.get_text() == 'ANDA':
                label.set_color('red')
                label.set_fontweight('bold')
                label.set_fontsize(14)
        
        plt.tight_layout()
        
        # D. Simpan Gambar ke Base64 String
        img = io.BytesIO()
        plt.savefig(img, format='png', dpi=100)
        img.seek(0)
        plot_url = base64.b64encode(img.getvalue()).decode()
        plt.close()
        
        return {"status": "success", "image": plot_url}

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))