import axios from 'axios'
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  // State untuk menyimpan nilai input user
  const [scores, setScores] = useState({ math: 75, history: 75, physics: 75 })

  // State untuk menyimpan hasil dashboard dari server
  const [dashboardData, setDashboardData] = useState(null)

  // State untuk loading indicator
  const [loading, setLoading] = useState(false)

  // Fungsi untuk mengirim data ke backend
  const handleSubmit = async () => {
    setLoading(true)
    setDashboardData(null) // Reset data lama
    try {
      // Ganti URL ini jika backend jalan di port/IP berbeda
      // const apiUrl = 'http://127.0.0.1:8000/api/generate-tree'
      const apiUrl = 'https://genealogyai.duckdns.org/api/generate-tree'

      const response = await axios.post(apiUrl, scores)

      console.log("Response from server:", response.data)
      console.log("Response from server:", response.data.insights)

      // Validasi dan simpan hasil dashboard lengkap ke state
      if (response.data && response.data.status === 'success') {
        setDashboardData({
          images: response.data.images || [], // [math_hist, history_hist, physics_hist, dendrogram]
          insights: response.data.insights || {}
        })
      } else {
        throw new Error('Invalid response format from server')
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Gagal memproses data. Pastikan backend FastAPI sudah berjalan dan seaborn terinstall.")
      
      // Set fallback data untuk debugging
      setDashboardData({
        images: [],
        insights: {
          profile: "Error: Tidak dapat membuat profil",
          description: "Silakan cek log backend",
          strategy: "Restart server backend",
          recommended_peer: "Tidak Ada",
          peer_reason: "Analisis gagal"
        }
      })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen py-4 sm:py-4 font-sans">
      <div className="max-w-7xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white p-8 sm:p-12 rounded-3xl shadow-2xl backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl sm:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  AI Silsilah Siswa
                </h1>
                <p className="text-blue-100 text-lg sm:text-xl font-medium">Peta Kekerabatan Gaya Belajar Siswa</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">

          {/* Panel Kiri: Input Nilai */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  Masukkan Nilai Anda
                </h2>
                <p className="text-indigo-100 mt-2">Atur slider untuk memasukkan nilai di setiap mata pelajaran</p>
              </div>
              
              <div className="p-8 space-y-8">
                {/* Slider Matematika */}
                <div className="group">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <label className="font-semibold text-gray-800 text-lg">Matematika</label>
                        <p className="text-sm text-gray-600">Kemampuan Logika & Perhitungan</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={scores.math}
                        onChange={(e) => {
                          const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                          setScores({ ...scores, math: value });
                        }}
                        className="text-3xl font-bold text-blue-600 bg-transparent border-none outline-none text-right w-16"
                      />
                      <p className="text-xs text-gray-500">/ 100</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="range" min="0" max="100" value={scores.math}
                        onChange={(e) => setScores({ ...scores, math: parseInt(e.target.value) })}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-all"
                        style={{
                          background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${scores.math}%, #E5E7EB ${scores.math}%, #E5E7EB 100%)`
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Atau ketik nilai:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={scores.math}
                        onChange={(e) => {
                          const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                          setScores({ ...scores, math: value });
                        }}
                        className="w-20 px-2 py-1 border border-blue-300 rounded-md text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Slider Sejarah */}
                <div className="group">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <label className="font-semibold text-gray-800 text-lg">Sejarah</label>
                        <p className="text-sm text-gray-600">Kemampuan Hafalan & Memori</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={scores.history}
                        onChange={(e) => {
                          const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                          setScores({ ...scores, history: value });
                        }}
                        className="text-3xl font-bold text-green-600 bg-transparent border-none outline-none text-right w-16"
                      />
                      <p className="text-xs text-gray-500">/ 100</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="range" min="0" max="100" value={scores.history}
                        onChange={(e) => setScores({ ...scores, history: parseInt(e.target.value) })}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600 hover:accent-green-700 transition-all"
                        style={{
                          background: `linear-gradient(to right, #10B981 0%, #10B981 ${scores.history}%, #E5E7EB ${scores.history}%, #E5E7EB 100%)`
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Atau ketik nilai:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={scores.history}
                        onChange={(e) => {
                          const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                          setScores({ ...scores, history: value });
                        }}
                        className="w-20 px-2 py-1 border border-green-300 rounded-md text-center text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Slider Fisika */}
                <div className="group">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <label className="font-semibold text-gray-800 text-lg">Fisika</label>
                        <p className="text-sm text-gray-600">Kemampuan Analisis & Konsep</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={scores.physics}
                        onChange={(e) => {
                          const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                          setScores({ ...scores, physics: value });
                        }}
                        className="text-3xl font-bold text-purple-600 bg-transparent border-none outline-none text-right w-16"
                      />
                      <p className="text-xs text-gray-500">/ 100</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="range" min="0" max="100" value={scores.physics}
                        onChange={(e) => setScores({ ...scores, physics: parseInt(e.target.value) })}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600 hover:accent-purple-700 transition-all"
                        style={{
                          background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${scores.physics}%, #E5E7EB ${scores.physics}%, #E5E7EB 100%)`
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Atau ketik nilai:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={scores.physics}
                        onChange={(e) => {
                          const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                          setScores({ ...scores, physics: value });
                        }}
                        className="w-20 px-2 py-1 border border-purple-300 rounded-md text-center text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg transition-all duration-300 shadow-lg transform hover:scale-[1.02] active:scale-[0.98]
                      ${loading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40'
                      }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        Sedang Menganalisis...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Buat Profil Belajar Saya
                      </span>
                    )}
                  </button>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mt-6 border border-blue-100">
                    <div className="flex items-center gap-3 text-blue-800">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm">
                        <p className="font-medium">Analisis menggunakan <span className="font-bold">Agglomerative Hierarchical Clustering</span></p>
                        <p className="text-blue-700 mt-1">Algoritma machine learning untuk mengelompokkan pola belajar siswa berdasarkan kesamaan nilai</p>
                      </div>
                    </div>
                  </div>

                  {/* Dataset Section */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mt-4 border border-green-100">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex items-center gap-3 text-green-800">
                        <svg className="w-10 h-10 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="text-sm text-left">
                          <p className="font-medium">Ingin melihat data siswa yang digunakan?</p>
                          <p className="text-green-700 mt-1">Lihat dataset lengkap dengan 40 sampel data siswa</p>
                        </div>
                      </div>
                      <a
                        href="https://docs.google.com/spreadsheets/d/1gHzbcyDQPe8Mcw7Q6H_s6_DByPYzRqgXHeLKY-8HqcE/edit?usp=sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-600 w-full mt-2 text-center hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Dataset Siswa
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel Kanan: Output Gambar */}
          <div className="lg:col-span-3 h-full">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-full">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  Laporan Diagnostik Siswa
                </h2>
                <p className="text-emerald-100 mt-2">Analisis pembelajaran komprehensif dan rekomendasi teman sebaya</p>
              </div>

              <div className="p-6  overflow-y-auto">
                {dashboardData && dashboardData.insights ? (
                  <div className="space-y-8 animate-fade-in">
                    {/* Executive Summary */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-blue-800 text-xl mb-3">🎓 Ringkasan Eksekutif</h3>
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <p><strong>Profil Pelajar:</strong> <span className="text-blue-700">{dashboardData.insights.profile || 'Menganalisis...'}</span></p>
                              <p><strong>Observasi:</strong> <span className="text-blue-700">{dashboardData.insights.description || 'Memproses data...'}</span></p>
                            </div>
                            <div className="space-y-2">
                              <p><strong>Strategi:</strong> <span className="text-blue-700">{dashboardData.insights.strategy || 'Membuat rekomendasi...'}</span></p>
                              <p><strong>Pasangan Teman:</strong> <span className="text-blue-700">{dashboardData.insights.recommended_peer || 'Mengidentifikasi teman...'}</span> ({dashboardData.insights.peer_reason || 'Menghitung kompatibilitas...'})</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Performance Distribution */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        📊 Distribusi Performa (Posisi Anda)
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {dashboardData.images && dashboardData.images.slice(0, 3).map((img, index) => {
                          const subjects = ['Matematika', 'Sejarah', 'Fisika'];
                          const colors = ['bg-blue-50 border-blue-200', 'bg-green-50 border-green-200', 'bg-purple-50 border-purple-200'];
                          return (
                            <div key={index} className={`rounded-xl border-2 ${colors[index]} p-3`}>
                              <h4 className="font-semibold text-center mb-2">{subjects[index]}</h4>
                              <img
                                src={`data:image/png;base64,${img}`}
                                alt={`${subjects[index]} Distribution`}
                                className="w-full h-auto rounded-lg shadow-sm"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Cognitive Genealogy */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        🧬 Silsilah Kognitif (Cara Anda Berpikir)
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-4 italic">
                          Pohon ini mengelompokkan siswa berdasarkan "Kesamaan Gaya Belajar". Siswa pada cabang yang sama memproses informasi dengan cara yang serupa.
                        </p>
                        {dashboardData.images && dashboardData.images[3] && (
                          <div className="bg-white rounded-lg shadow-lg p-4">
                            <img
                              src={`data:image/png;base64,${dashboardData.images[3]}`}
                              alt="Cognitive Genealogy Tree"
                              className="w-full h-auto rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Success Message */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-green-800 text-lg mb-2">✅ Analisis Selesai!</h3>
                          <p className="text-green-700">
                            Profil pembelajaran komprehensif Anda telah dibuat menggunakan algoritma machine learning canggih. 
                            Label <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded">ANDA</span> menunjukkan posisi Anda 
                            relatif terhadap siswa lain dalam pohon silsilah kognitif.
                          </p>
                          <div className="mt-3 text-sm text-green-600">
                            <p>💡 <strong>Tips Interpretasi:</strong></p>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              <li>Cabang yang lebih dekat = gaya belajar yang lebih mirip</li>
                              <li>Grafik distribusi menunjukkan peringkat Anda vs teman sekelas</li>
                              <li>Profil pembelajaran Anda menyarankan strategi belajar optimal</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center min-h-[500px] lg:min-h-[600px]">
                    <div className="text-center text-gray-400 p-8 max-w-md">
                      {loading ? (
                        <div className="flex flex-col items-center space-y-6">
                          <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-8 h-8 bg-indigo-600 rounded-full animate-pulse"></div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-lg font-semibold text-indigo-600">Membuat laporan komprehensif...</p>
                            <p className="text-sm text-gray-500">Menjalankan algoritma clustering & membuat visualisasi</p>
                          </div>
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <div className="space-y-3">
                            <h3 className="text-xl font-semibold text-gray-600">Dashboard Analitik Lanjutan</h3>
                            <p className="text-gray-500 leading-relaxed">
                              Masukkan nilai Anda dan klik <strong>"Buat Profil Belajar Saya"</strong> untuk menerima:
                            </p>
                            <ul className="text-left text-sm text-gray-600 space-y-1">
                              <li>• Analisis distribusi performa</li>
                              <li>• Pohon silsilah kognitif</li>
                              <li>• Profil gaya belajar</li>
                              <li>• Rekomendasi teman sebaya</li>
                            </ul>
                          </div>
                          <div className="grid grid-cols-3 gap-2 mt-6">
                            <div className="h-2 bg-gradient-to-r from-blue-200 to-blue-300 rounded-full animate-pulse"></div>
                            <div className="h-2 bg-gradient-to-r from-green-200 to-green-300 rounded-full animate-pulse" style={{animationDelay: '200ms'}}></div>
                            <div className="h-2 bg-gradient-to-r from-purple-200 to-purple-300 rounded-full animate-pulse" style={{animationDelay: '400ms'}}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
        
        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white p-8">
              <p className="text-gray-500 text-sm">
                © 2025 AI Silsilah Siswa • Oleh Evida Nur Churin`in, Afiif Al Hauzaan Alfian, Anisah Khansa Zhafirah, Auliyaa Zulfa • Asosiasi dengan Fakultas Ilmu Komputer Universitas Brawijaya
              </p>
            </div>
          </div>
        </div>
    </div>
  )
}

export default App
