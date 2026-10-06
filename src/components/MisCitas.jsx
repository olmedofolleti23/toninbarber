import React, { useState } from 'react';

const MisCitas = ({ onClose }) => {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState(localStorage.getItem('tonin_pin') || '');
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchCitas = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 9 || !pin) {
      setError('Introduce un teléfono y PIN válidos');
      return;
    }
    
    setLoading(true);
    setError('');
    setSearched(true);
    
    try {
      const response = await fetch('/api/mis-citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener citas');
      }
      
      setCitas(data.citas || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (eventId) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta cita?')) return;
    
    setCancellingId(eventId);
    try {
      const response = await fetch('/api/cancelar-cita', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, phone, pin })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al cancelar');
      
      alert('Cita cancelada correctamente');
      setCitas(citas.filter(c => c.id !== eventId));
    } catch (err) {
      alert(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-2xl w-full max-w-md p-6 shadow-xl relative overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
        
        <h2 className="text-2xl font-headline-md text-primary mb-2 uppercase">Mis Citas</h2>
        <p className="text-on-surface-variant text-sm mb-6">Consulta o cancela tus reservas introduciendo tu número de teléfono.</p>
        
        <form onSubmit={fetchCitas} className="flex flex-col gap-3 mb-6">
          <div className="flex gap-2">
            <input 
              type="tel" 
              required 
              placeholder="Teléfono"
              className="flex-1 bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-2 text-on-surface focus:border-primary outline-none" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
            />
            <input 
              type="password" 
              required 
              placeholder="PIN"
              maxLength="6"
              className="w-24 bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-2 text-on-surface focus:border-primary outline-none tracking-widest text-center" 
              value={pin} 
              onChange={(e) => setPin(e.target.value)} 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-2 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary-fixed transition-colors disabled:opacity-50"
          >
            {loading ? 'Buscando...' : 'Buscar mis citas'}
          </button>
          <p className="text-[11px] text-center text-on-surface-variant opacity-70">El PIN se configuró al crear tu reserva. Si lo has olvidado, contacta con la barbería.</p>
        </form>

        {error && <div className="mb-4 p-3 bg-error/20 text-error rounded-lg text-sm">{error}</div>}

        {searched && !loading && citas.length === 0 && !error && (
          <div className="text-center p-6 bg-surface-container rounded-xl">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/50 mb-2">calendar_today</span>
            <p className="text-on-surface-variant text-sm">No tienes citas pendientes ni recientes.</p>
          </div>
        )}

        {citas.length > 0 && (
          <div className="flex flex-col gap-3">
            {citas.map(cita => (
              <div key={cita.id} className="bg-surface-container rounded-xl p-4 border border-outline-variant/30">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-on-surface">{cita.summary.replace('Cita: ', '')}</h4>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase ${cita.status === 'Pendiente' ? 'bg-green-500/20 text-green-400' : 'bg-outline-variant/30 text-on-surface-variant'}`}>
                    {cita.status}
                  </span>
                </div>
                <div className="text-sm text-on-surface-variant mb-3">
                  <p>📅 {cita.date}</p>
                  <p>⏰ {cita.time}</p>
                </div>
                
                {cita.status === 'Pendiente' && (
                  <button 
                    onClick={() => handleCancel(cita.id)}
                    disabled={cancellingId === cita.id}
                    className="w-full py-2 rounded-lg border border-error/50 text-error text-sm font-bold hover:bg-error/10 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    {cancellingId === cita.id ? 'Cancelando...' : 'Cancelar Cita'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisCitas;
