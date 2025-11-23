import axios from 'axios'
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  // State untuk menyimpan nilai input user
  const [scores, setScores] = useState({ math: 75, history: 75, physics: 75 })

  // State untuk menyimpan hasil gambar dari server
  const [image, setImage] = useState(null)

  // State untuk loading indicator
  const [loading, setLoading] = useState(false)

  // Fungsi untuk mengirim data ke backend
  const handleSubmit = async () => {
    setLoading(true)
    setImage(null) // Reset gambar lama
    try {
      // Ganti URL ini jika backend jalan di port/IP berbeda
      const apiUrl = 'https://genealogyai.duckdns.org/api/generate-tree'

      const response = await axios.post(apiUrl, scores)

      // Simpan string base64 gambar ke state
      if (response.data.status === 'success') {
        setImage(response.data.image)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Gagal memproses data. Pastikan backend FastAPI sudah berjalan.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="bg-indigo-600 p-8 text-white text-center">
          <h1 className="text-4xl font-bold mb-2">Student Genealogy AI</h1>
          <p className="text-indigo-100 text-lg">Peta Kekerabatan Gaya Belajar Siswa</p>
        </div>

        <div className="p-8 grid md:grid-cols-3 gap-8">

          {/* Panel Kiri: Input Nilai */}
          <div className="md:col-span-1 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Masukkan Nilai Anda</h2>

            {/* Slider Matematika */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="font-medium text-gray-700">Matematika (Logika)</label>
                <span className="font-bold text-indigo-600">{scores.math}</span>
              </div>
              <input
                type="range" min="0" max="100" value={scores.math}
                onChange={(e) => setScores({ ...scores, math: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Slider Sejarah */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="font-medium text-gray-700">Sejarah (Hafalan)</label>
                <span className="font-bold text-indigo-600">{scores.history}</span>
              </div>
              <input
                type="range" min="0" max="100" value={scores.history}
                onChange={(e) => setScores({ ...scores, history: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Slider Fisika */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="font-medium text-gray-700">Fisika (Analisis)</label>
                <span className="font-bold text-indigo-600">{scores.physics}</span>
              </div>
              <input
                type="range" min="0" max="100" value={scores.physics}
                onChange={(e) => setScores({ ...scores, physics: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all shadow-md 
                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'}`}
            >
              {loading ? 'Sedang Menganalisis...' : 'Lihat Posisi Saya di Pohon'}
            </button>

            <div className="text-xs text-gray-500 mt-4 text-center">
              *Analisis menggunakan Agglomerative Hierarchical Clustering
            </div>
          </div>

          {/* Panel Kanan: Output Gambar */}
          <div className="md:col-span-2 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center min-h-[400px]">
            {image ? (
              <div className="w-full h-full p-2 animate-fade-in">
                <img
                  src={`data:image/png;base64,${image}`}
                  alt="Dendrogram Result"
                  className="w-full h-auto rounded shadow-sm"
                />
                <p className="text-center text-sm text-green-600 mt-2 font-medium">
                  ✅ Label <span className="font-bold text-red-600">ANDA</span> menunjukkan posisi kekerabatan gaya belajar Anda.
                </p>
              </div>
            ) : (
              <div className="text-center text-gray-400 p-6">
                {loading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-2"></div>
                    <p>Sedang menghitung jarak & membuat pohon...</p>
                  </div>
                ) : (
                  <>
                    <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p>Grafik Dendrogram akan muncul di sini</p>
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default App
