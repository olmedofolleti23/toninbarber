import React, { useState, useEffect } from 'react';
import { serviciosData } from './Servicios';

const FormularioReserva = ({ service, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    serviceId: service ? service.id.toString() : ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successToken, setSuccessToken] = useState(null);

  useEffect(() => {
    if (service) {
      setFormData(prev => ({ ...prev, serviceId: service.id.toString() }));
    }
  }, [service]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!formData.serviceId) {
      setError("Por favor, selecciona un servicio.");
      setLoading(false);
      return;
    }

    const selectedServiceData = serviciosData.find(s => s.id.toString() === formData.serviceId);

    try {
      const response = await fetch('/api/crear-cita', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          serviceName: selectedServiceData.name,
          duracion: selectedServiceData.duracion
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al crear la cita');
      setSuccessToken(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (successToken) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-surface rounded-2xl w-full max-w-md p-8 shadow-xl relative text-center">
          <span className="material-symbols-outlined text-[64px] text-green-500 mb-4">check_circle</span>
          <h2 className="text-2xl font-headline-md text-primary mb-2 uppercase">¡Cita Confirmada!</h2>
          <p className="text-on-surface-variant mb-6">Tu reserva se ha completado con éxito.</p>
          <div className="bg-surface-container rounded-xl p-4 mb-6">
            <p className="text-sm text-on-surface-variant mb-2">Guarda este código por si necesitas cancelar la reserva en el futuro:</p>
            <p className="text-2xl font-mono font-bold tracking-[0.2em] text-on-surface select-all">{successToken}</p>
          </div>
          <button onClick={onClose} className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold uppercase tracking-wider hover:bg-primary-fixed transition-colors">
            Entendido
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-2xl w-full max-w-md p-6 shadow-xl relative overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
        <h2 className="text-2xl font-headline-md text-primary mb-6 uppercase">Reservar Cita</h2>
        
        {error && <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-on-surface-variant mb-1 font-bold">Servicio</label>
            <select 
              required
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:border-primary outline-none appearance-none" 
              value={formData.serviceId} 
              onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
            >
              <option value="" disabled>Selecciona tu servicio...</option>
              {serviciosData.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.duracion} min) - {s.price}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-on-surface-variant mb-1 font-bold">Nombre</label>
            <input type="text" required className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-2 text-on-surface focus:border-primary outline-none" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-on-surface-variant mb-1 font-bold">Teléfono</label>
            <input type="tel" required className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-2 text-on-surface focus:border-primary outline-none" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-on-surface-variant mb-1 font-bold">Fecha</label>
              <input type="date" required className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-2 text-on-surface focus:border-primary outline-none [color-scheme:dark]" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm text-on-surface-variant mb-1 font-bold">Hora</label>
              <input type="time" required className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-2 text-on-surface focus:border-primary outline-none [color-scheme:dark]" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} />
            </div>
          </div>
          <button type="submit" disabled={loading} className="mt-4 w-full py-3 rounded-xl bg-primary text-on-primary font-bold uppercase tracking-wider hover:bg-primary-fixed transition-colors disabled:opacity-50">
            {loading ? 'Procesando...' : 'Confirmar Reserva'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormularioReserva;
