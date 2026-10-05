import React, { useState } from 'react';

const serviciosData = [
  { id: 1, name: 'Corte', time: '30 min • Fade & Tijera', price: '10€', category: 'cortes' },
  { id: 2, name: 'Corte + Cejas', time: '35 min • Perfilado fino', price: '12€', category: 'cortes' },
  { id: 3, name: 'Corte + Barba', time: '45 min • Ritual & Navaja', price: '14€', category: 'cortes' },
  { id: 4, name: 'Mechas + Corte', time: '90 min • Combo Top', price: '29€', category: 'color' },
  { id: 5, name: 'Mechas', time: '60 min • Tonos modernos', price: '20€', category: 'color' },
  { id: 6, name: 'Decoloración', time: '70 min • Rubio platino / Base', price: '20€', category: 'color' }
];

const Servicios = () => {
  const [filter, setFilter] = useState('all');
  const [selectedService, setSelectedService] = useState(null);

  const filteredServices = filter === 'all' 
    ? serviciosData 
    : serviciosData.filter(s => s.category === filter);

  const handleSelectBooking = (service) => {
    setSelectedService(service);
    const text = encodeURIComponent(`¡Hola Tonín! Me gustaría reservar cita para: ${service.name} - ${service.price}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <section id="servicios" className="w-full max-w-7xl mx-auto px-4 lg:px-12 py-8 lg:py-16 relative bg-surface">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-label-tag text-[11px] lg:text-xs uppercase tracking-widest text-primary font-bold">Menú Profesional</span>
          </div>
          <h2 className="font-headline-xl-mobile lg:font-headline-xl text-[28px] lg:text-5xl text-on-surface uppercase tracking-wider">
            SERVICIOS & TARIFAS
          </h2>
        </div>
        
        {/* Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button 
            onClick={() => setFilter('all')}
            className={`whitespace-nowrap px-4 py-2 rounded-full font-label-tag text-[11px] lg:text-xs font-bold tracking-wider uppercase transition-all ${filter === 'all' ? 'bg-primary-container text-on-primary-fixed shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFilter('cortes')}
            className={`whitespace-nowrap px-4 py-2 rounded-full font-label-tag text-[11px] lg:text-xs font-bold tracking-wider uppercase transition-all ${filter === 'cortes' ? 'bg-primary-container text-on-primary-fixed shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'}`}
          >
            Cortes & Barba
          </button>
          <button 
            onClick={() => setFilter('color')}
            className={`whitespace-nowrap px-4 py-2 rounded-full font-label-tag text-[11px] lg:text-xs font-bold tracking-wider uppercase transition-all ${filter === 'color' ? 'bg-primary-container text-on-primary-fixed shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'}`}
          >
            Mechas & Color
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {filteredServices.map(service => (
          <article key={service.id} className="bg-surface-container-low rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-md lg:shadow-lg border border-outline-variant/10 lg:border-outline-variant/20 flex flex-col justify-between gap-4 lg:gap-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex flex-col min-w-0">
                <h3 className="font-title-md text-[16px] lg:text-xl font-bold text-on-surface truncate mb-1">{service.name}</h3>
                <span className="font-body-sm text-[12px] lg:text-sm text-on-surface-variant flex items-center gap-1">
                  {service.time}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 lg:pt-4 border-t border-outline-variant/10 lg:border-outline-variant/20">
              <div className="px-2.5 lg:px-3.5 py-1 lg:py-1.5 rounded-lg bg-surface-container-high">
                <span className="font-price-hero text-[26px] text-primary leading-none">{service.price}</span>
              </div>
              <button 
                onClick={() => handleSelectBooking(service)}
                className="py-2 px-3 lg:px-4 rounded-lg lg:rounded-xl bg-primary-container hover:bg-primary text-on-primary-fixed flex items-center gap-2 shadow-md font-bold text-sm transition-all active:scale-90 uppercase tracking-wider"
              >
                <span className="hidden lg:inline material-symbols-outlined text-[18px]">add</span>
                Reservar
              </button>
            </div>
          </article>
        ))}
      </div>
      
      {selectedService && (
        <div className="mt-6 p-4 rounded-xl bg-surface-container-low text-center text-on-surface-variant text-sm border border-primary/20">
          Último servicio pulsado: <span className="text-primary font-bold">{selectedService.name} ({selectedService.price})</span>
        </div>
      )}
    </section>
  );
};

export default Servicios;
