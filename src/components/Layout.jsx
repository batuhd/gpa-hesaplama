import { useState, useCallback } from 'react';

const menuItems = [
  {
    id: 'results',
    label: 'Sınav Sonuçlarım',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'transcript',
    label: 'Transkript',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Veri Yönetimi',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5l0 5m0-5l0 5" />
      </svg>
    ),
  },
];

function GenericUserIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

export default function Layout({ children, currentPage, setPage }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const openMobile = useCallback(() => setMobileOpen(true), []);

  return (
    <div className="flex h-screen w-full bg-[#f4f6f8]">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={
          `fixed lg:static inset-y-0 left-0 z-50 w-56 bg-white border-r border-[#dee2e6] ` +
          `flex flex-col transition-transform duration-300 ease-in-out ` +
          `${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`
        }
      >
        {/* Brand */}
        <div className="h-14 flex items-center px-4 border-b border-[#dee2e6] bg-[#3c4b64]">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-6 h-6 bg-white/90 rounded-sm p-0.5 object-contain" />
            <span className="text-white font-bold text-sm tracking-wide">GPA Hesaplama</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {menuItems.map((item) => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setPage(item.id);
                  closeMobile();
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition border-l-4
                  ${active
                    ? 'bg-[#e8f0fe] text-[#0056b3] border-[#0056b3]'
                    : 'text-[#555] border-transparent hover:bg-[#f1f5f9] hover:text-[#333]'
                  }
                `}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#dee2e6] text-[10px] text-gray-400 text-center leading-tight">
          Sinop'ta ❤️ ile yapıldı
          <br />
          ©batuhd
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-[#3c4b64] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={openMobile}
              className="lg:hidden text-white p-1.5 hover:bg-white/10 rounded transition"
              aria-label="Menüyü Aç"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-white/90 text-sm font-medium hidden sm:inline">Merhaba, Öğrenci</span>
            <div
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white border border-white/30"
              aria-label="Kullanıcı"
            >
              <GenericUserIcon className="w-5 h-5" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
