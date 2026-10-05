import React from 'react';

const Galeria = () => {
  const fotos = [
    { src: '/gallery/corte1.png', alt: 'Corte 1' },
    { src: '/gallery/corte2.png', alt: 'Corte 2' },
    { src: '/gallery/corte3.png', alt: 'Corte 3' },
    { src: '/gallery/corte4.png', alt: 'Corte 4' },
  ];

  return (
    <section id="galeria" className="w-full max-w-7xl mx-auto px-4 lg:px-12 py-8 lg:py-16 relative">
      <div className="flex flex-col items-center text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high/90 shadow-sm mb-4">
          <span className="material-symbols-outlined text-primary text-[18px]">content_cut</span>
          <span className="font-label-tag text-[11px] lg:text-xs uppercase tracking-widest text-primary font-bold">Trabajos Reales</span>
        </div>
        <h2 className="font-headline-xl text-3xl lg:text-5xl text-primary uppercase tracking-wider mb-4">
          EL ESTILO <span className="text-on-surface">DE LA CASA</span>
        </h2>
        <p className="font-body-md lg:font-body-lg text-sm lg:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
          Cortes limpios, texturas cuidadas y degradados al milímetro hechos por Tonín.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {fotos.map((foto, index) => (
          <div key={index} className="group relative rounded-lg overflow-hidden bg-surface-container-low border border-outline-variant/30 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
            <div className="aspect-square w-full overflow-hidden">
              <img 
                src={foto.src} 
                alt={foto.alt} 
                className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105" 
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-10">
        <a 
          href="https://instagram.com/tonin.barber" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="py-3.5 px-6 lg:px-8 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary hover:text-on-surface border border-outline-variant/30 font-label-button text-[12px] lg:text-xs tracking-wider uppercase transition-all duration-200 flex items-center gap-2.5 shadow-md group"
        >
          <span className="material-symbols-outlined text-[20px] text-primary">photo_camera</span>
          <span>Ver más cortes en Instagram</span>
          <span className="hidden sm:inline material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </a>
      </div>
    </section>
  );
};

export default Galeria;
