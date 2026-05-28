import { useState } from 'react';

export default function Ayarlar({ settings, onSave }) {
  const [form, setForm] = useState({ ...settings });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      socials: { ...prev.socials, [field]: value },
    }));
  };

  const handleSave = () => {
    onSave({ ...form });
    alert('Ayarlar kaydedildi!');
  };

  const handleReset = () => {
    if (confirm('TÜM ders ve ayar verileriniz silinecek. Emin misiniz?')) {
      localStorage.removeItem('geminigpa_v2_data');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="bg-white border border-[#dee2e6] rounded-md p-4">
        <h2 className="text-base font-bold text-[#333] mb-4">Ayarlar</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Ad Soyad</label>
            <input
              type="text"
              value={form.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="Örn: MUHAMMED BATUHAN DEDİ"
            />
          </div>

          <div className="pt-2">
            <p className="text-sm font-semibold text-[#333] mb-3">Sosyal Medya Bağlantıları</p>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">GitHub</label>
                <input
                  type="text"
                  value={form.socials?.github || ''}
                  onChange={(e) => handleSocialChange('github', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="https://github.com/kullaniciadi"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">LinkedIn</label>
                <input
                  type="text"
                  value={form.socials?.linkedin || ''}
                  onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="https://linkedin.com/in/kullaniciadi"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Instagram</label>
                <input
                  type="text"
                  value={form.socials?.instagram || ''}
                  onChange={(e) => handleSocialChange('instagram', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="https://instagram.com/kullaniciadi"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              onClick={handleSave}
              className="bg-[#0056b3] text-white text-sm font-medium px-5 py-2 rounded hover:bg-[#004494] transition"
            >
              Kaydet
            </button>
            <button
              onClick={handleReset}
              className="bg-red-50 text-red-600 border border-red-200 text-sm font-medium px-5 py-2 rounded hover:bg-red-100 transition"
            >
              Tüm Verileri Sıfırla
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#cce5ff] border border-[#b8daff] text-[#004085] text-xs px-4 py-3 rounded">
        <p className="font-semibold mb-1">Bilgi</p>
        <p>Tüm verileriniz tarayıcınızın yerel depolama alanında (localStorage) saklanır. Sayfayı kapatsanız bile silinmez. Farklı bir tarayıcı veya cihazda verilerinizi göremezsiniz.</p>
      </div>
    </div>
  );
}
