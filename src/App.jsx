import React from 'react';
import Hero from './components/Hero';
import Servicios from './components/Servicios';
import PromoBono from './components/PromoBono';
import Horarios from './components/Horarios';
import Footer from './components/Footer';
import Galeria from './components/Galeria';

function App() {
  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col">
      {/* Desktop Header (simplified for demo) */}
      <header className="fixed top-0 w-full z-50 bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto h-16 lg:h-20 px-4 lg:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 lg:gap-3">
            <span className="material-symbols-outlined text-primary text-[22px]">content_cut</span>
            <span className="font-headline-lg text-[22px] lg:text-[26px] tracking-wider text-primary uppercase">Tonín Barber</span>
          </div>
          <div className="hidden lg:flex items-center gap-8 font-label-button text-sm uppercase tracking-wider text-on-surface">
            <a href="#servicios" className="hover:text-primary transition-colors">Servicios & Tarifas</a>
            <a href="#galeria" className="hover:text-primary transition-colors">El Estilo</a>
            <a href="#promociones" className="hover:text-primary transition-colors">Bono Ahorro</a>
            <a href="#horarios" className="hover:text-primary transition-colors">Horarios</a>
          </div>
          <a href="#servicios" className="hidden sm:flex py-2 px-4 rounded-xl bg-primary-container hover:bg-primary text-on-primary-fixed font-label-button text-xs font-bold uppercase transition-all shadow-[0_4px_20px_rgba(245,158,11,0.3)]">
            ¡Reserva tu cita!
          </a>
        </div>
      </header>

      <main className="flex-1 relative w-full pt-20 bg-surface">
        <Hero />
        <Servicios />
        <Galeria />
        
        <section id="promociones" className="w-full max-w-7xl mx-auto px-4 lg:px-12 py-8 lg:py-16 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-6">
              <PromoBono />
            </div>
            <div className="lg:col-span-6 flex flex-col h-full">
              <Horarios />
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}

export default App;
