import { useRef, useState } from 'react';
import { exportDataToFile, importDataFromFile } from '../utils/storage';

export default function VeriYonetimi({ courses, onImport }) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleExport = () => {
    exportDataToFile({ courses });
  };

  const handleFile = async (file) => {
    if (!file || file.type !== 'application/json') {
      onImport(null, 'Lütfen geçerli bir JSON dosyası seçin.');
      return;
    }
    try {
      const data = await importDataFromFile(file);
      onImport(data, null);
    } catch (err) {
      onImport(null, err.message);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Export */}
      <div className="bg-white border border-[#dee2e6] rounded-md p-6">
        <h2 className="text-base font-bold text-[#333] mb-2">Verileri Dışa Aktar</h2>
        <p className="text-sm text-gray-500 mb-4">
          Mevcut derslerinizi ve notlarınızı JSON dosyası olarak indirin.
        </p>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 bg-[#0056b3] text-white text-sm font-medium px-5 py-3 rounded hover:bg-[#004494] transition active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Yedek İndir
        </button>
      </div>

      {/* Import */}
      <div className="bg-white border border-[#dee2e6] rounded-md p-6">
        <h2 className="text-base font-bold text-[#333] mb-2">Verileri İçe Aktar</h2>
        <p className="text-sm text-gray-500 mb-4">
          Daha önce yedeklediğiniz JSON dosyasını yükleyin. Bu işlem mevcut verilerinizin üzerine yazar.
        </p>

        {/* Dropzone + File Button */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition
            ${dragOver ? 'border-[#0056b3] bg-[#e8f0fe]' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}
          `}
        >
          <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm font-medium text-gray-700 mb-3">Dosyayı buraya bırakın</p>
          
          <button
            type="button"
            onClick={triggerFileInput}
            className="inline-flex items-center gap-2 bg-white border border-gray-300 text-[#333] text-sm font-medium px-5 py-2.5 rounded hover:bg-[#f1f5f9] transition active:scale-95 shadow-sm"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            Dosya Seç
          </button>
          <p className="text-xs text-gray-400 mt-2">Sadece .json dosyaları</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFile(e.target.files[0]);
            e.target.value = '';
          }}
        />
      </div>

      {/* Info */}
      <div className="bg-[#f8f9fa] border border-[#dee2e6] rounded-md p-4 text-xs text-gray-500 leading-relaxed">
        <p><strong>Not:</strong> Veriler tarayıcınızın yerel deposunda (localStorage) saklanır. Tarayıcı önbelleği temizlendiğinde veriler silinebilir. Bu yüzden düzenli yedek almanız önerilir.</p>
      </div>
    </div>
  );
}
