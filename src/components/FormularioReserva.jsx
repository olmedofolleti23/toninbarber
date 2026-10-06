import React, { useState, useEffect } from 'react';
import { serviciosData } from './Servicios';

const FormularioReserva = ({ service, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    serviceId: service ? service.id.toString() : '',
    pin: localStorage.getItem('tonin_pin') || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successEventId, setSuccessEventId] = useState(null);

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
    
    if (!formData.phone || formData.phone.length < 9) {
      setError('El número de teléfono es obligatorio y debe ser válido');
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
          pin: formData.pin,
          duracion: selectedServiceData.duracion
        })
      });
      
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        throw new Error('Error interno del servidor. Respuesta: ' + text.substring(0, 50));
      }

      if (!response.ok) {
        if (data.stack) {
          console.error('Error detallado del Backend:', data.error);
          console.error('Stack Trace:', data.stack);
        }
        throw new Error(data.error || 'Error al crear la cita');
      }
      
      // Auto-guardado en localStorage (Para auto-cancelar)
      const newBooking = {
        token: data.eventId,
        date: formData.date,
        time: formData.time,
        serviceName: selectedServiceData.name
      };
      
      let existingBookings = [];
      try {
        existingBookings = JSON.parse(localStorage.getItem('tonin_bookings') || '[]');
      } catch(e) {}

      localStorage.setItem('tonin_bookings', JSON.stringify([...existingBookings, newBooking]));

      localStorage.setItem('tonin_pin', formData.pin);

      setSuccessEventId(data.eventId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [isCancelling, setIsCancelling] = useState(false);

  const handleImmediateCancel = async () => {
    const confirmCancel = window.confirm('¿Estás seguro de que deseas eliminar esta reserva?');
    if (!confirmCancel) return;

    setIsCancelling(true);
    try {
      const response = await fetch('/api/cancelar-cita', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: successEventId, phone: formData.phone, pin: formData.pin })
      });
      if (!response.ok) throw new Error('Error al cancelar');
      alert('Reserva eliminada correctamente.');
      


      setSuccessEventId(null);
      onClose();
    } catch (err) {
      alert('Hubo un problema al cancelar. Por favor, contacta con nosotros.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (successEventId) {
    const selectedServiceData = serviciosData.find(s => s.id.toString() === formData.serviceId);
    const serviceName = selectedServiceData ? selectedServiceData.name : 'Servicio';
    
    const textToCopy = `Cita confirmada en Tonín Barbería\nServicio: ${serviceName}\nFecha: ${formData.date}\nHora: ${formData.time}\n`;

    const handleCopy = () => {
      navigator.clipboard.writeText(textToCopy);
      alert('¡Datos copiados al portapapeles!');
    };

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-surface rounded-2xl w-full max-w-md p-8 shadow-xl relative text-center max-h-[90vh] overflow-y-auto">
          <span className="material-symbols-outlined text-[64px] text-green-500 mb-2">check_circle</span>
          <h2 className="text-2xl font-headline-md text-primary mb-2 uppercase">¡Cita Confirmada!</h2>
          <p className="text-on-surface-variant mb-6 text-sm">Tu reserva se ha completado con éxito. Aquí tienes los detalles:</p>
          
          <div className="bg-surface-container rounded-xl p-5 mb-6 text-left border border-outline-variant/30">
            <div className="flex justify-between border-b border-outline-variant/20 pb-2 mb-2">
              <span className="font-bold text-on-surface-variant text-sm">Servicio:</span>
              <span className="font-medium text-on-surface text-sm">{serviceName}</span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/20 pb-2 mb-2">
              <span className="font-bold text-on-surface-variant text-sm">Fecha:</span>
              <span className="font-medium text-on-surface text-sm">{formData.date}</span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/20 pb-2 mb-4">
              <span className="font-bold text-on-surface-variant text-sm">Hora:</span>
              <span className="font-medium text-on-surface text-sm">{formData.time}</span>
            </div>
            
            <p className="text-xs text-on-surface-variant text-center mb-1">Puedes gestionar y cancelar tus citas desde la sección 'Mis Citas' usando tu teléfono móvil y PIN.</p>
          </div>
          
          <div className="flex flex-col gap-3">
            <button onClick={handleCopy} className="w-full py-3 rounded-xl bg-surface-container-high text-on-surface font-bold uppercase tracking-wider hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2 text-sm border border-outline-variant/50">
              <span className="material-symbols-outlined text-[18px]">content_copy</span>
              Copiar Datos
            </button>
            <button onClick={onClose} className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold uppercase tracking-wider hover:bg-primary-fixed transition-colors text-sm">
              Finalizar
            </button>
            <button onClick={handleImmediateCancel} disabled={isCancelling} className="mt-2 w-full py-2 rounded-xl text-error font-bold tracking-wider hover:bg-error/10 transition-colors text-xs flex items-center justify-center gap-1 disabled:opacity-50">
              <span className="material-symbols-outlined text-[16px]">delete</span>
              {isCancelling ? 'Cancelando...' : 'Me he equivocado, cancelar ahora'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const generateTimeOptions = () => {
    if (!formData.date) return <option value="" disabled>Elige primero una fecha</option>;
    const date = new Date(formData.date);
    const day = date.getDay(); // 0 Sunday
    if (day === 0) return <option value="" disabled>Domingos cerrado</option>;
    
    const slots = [];
    const addRange = (startH, endH) => {
      let curr = new Date(date); curr.setHours(startH, 0, 0, 0);
      const end = new Date(date); end.setHours(endH, 0, 0, 0);
      while (curr < end) {
        const h = curr.getHours();
        const m = curr.getMinutes();
        const val = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        const label = `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
        slots.push({ val, label });
        curr.setMinutes(curr.getMinutes() + 15);
      }
    };

    if (day >= 1 && day <= 5) {
      addRange(11, 14);
      addRange(16, 21);
    } else if (day === 6) {
      addRange(10, 14);
    }
    
    if (slots.length === 0) return <option value="" disabled>Sin horarios</option>;
    
    return slots.map((s, i) => <option key={i} value={s.val}>{s.label}</option>);
  };

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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-on-surface-variant mb-1 font-bold">Teléfono</label>
              <input type="tel" required className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-2 text-on-surface focus:border-primary outline-none" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm text-on-surface-variant mb-1 font-bold">PIN Seguridad</label>
              <input type="password" required pattern="[0-9]{4,6}" placeholder="Ej: 1234" maxLength="6" className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-2 text-on-surface focus:border-primary outline-none tracking-widest" value={formData.pin} onChange={(e) => setFormData({...formData, pin: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-on-surface-variant mb-1 font-bold">Fecha</label>
              <input type="date" required className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-2 text-on-surface focus:border-primary outline-none [color-scheme:dark]" value={formData.date} onChange={(e) => { setFormData({...formData, date: e.target.value, time: ''}); }} />
            </div>
            <div>
              <label className="block text-sm text-on-surface-variant mb-1 font-bold">Hora</label>
              <select required className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-2 text-on-surface focus:border-primary outline-none appearance-none" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})}>
                <option value="" disabled>--:--</option>
                {generateTimeOptions()}
              </select>
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
