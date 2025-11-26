'use client';

import { FCEventData } from '@/lib/types/db';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: FCEventData) => Promise<void>;
  onDelete?: () => Promise<void>;
  baseEvent: FCEventData;
  mode: 'create' | 'edit';
}

interface EventFormState {
  title: string;
  start: Date;
  duration: number;
  members: string;
  repeat_weekly: number;
}

function EventToFormState(fcEvent: FCEventData): EventFormState {
  
  console.log('Converting FCEventData to EventFormState:', fcEvent);
  const startDate = new Date(fcEvent.start);
  const endDate = new Date(fcEvent.end);
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const duration = diffHours > 0 ? diffHours : 1;

  const formState: EventFormState = {
    title: fcEvent.title,
    start: fcEvent.start,
    duration,
    members: fcEvent.extendedProps.members,
    repeat_weekly: fcEvent.extendedProps.repeat_weekly,
  };

  return formState;
}
  
function FormStateToEvent(formState: EventFormState): FCEventData {
  const startDate = new Date(formState.start);
  const endDate = new Date(startDate.getTime() + formState.duration * 60 * 60 * 1000);

  const newCalendarEvent: FCEventData = {
    title: formState.title,
    start: startDate,
    end: endDate,
    extendedProps: {
      members: formState.members,
      repeat_weekly: formState.repeat_weekly,
    },
  };

  return newCalendarEvent;
}

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  baseEvent,
  mode,
}: EventModalProps) {
  
  const [formState, setFormState] = useState<EventFormState>(EventToFormState(baseEvent));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    setFormState(EventToFormState(baseEvent));
    setIsSaving(false);
    setIsDeleting(false);
    setErrorMessage(null);
  }, [baseEvent, isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSaving && !isDeleting) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isSaving, isDeleting, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formState.title.trim() && formState.members.trim() && formState.start && formState.duration && formState.duration > 0) {
      const startDate = new Date(formState.start);
      const endDate = new Date(startDate.getTime() + formState.duration * 60 * 60 * 1000);
      const durationMs = endDate.getTime() - startDate.getTime();

      if (durationMs <= 0) {
        setErrorMessage('La fin doit être après le début.');
        return;
      }

      if (durationMs > 24 * 60 * 60 * 1000) {
        setErrorMessage('Une session ne peut pas dépasser 24 heures.');
        return;
      }

      setErrorMessage(null);
      const newEvent = FormStateToEvent(formState);
      setIsSaving(true);
      try {
        await onSave(newEvent);
        onClose();
      } catch (error) {
        console.error('Error saving event:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete();
      onClose();
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDatetimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (!isSaving && !isDeleting) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div 
        className="flex min-h-dvh items-start sm:items-center justify-center px-3 py-4 sm:px-4 sm:py-6 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-100/10 w-full max-w-md"
          style={{ maxHeight: 'calc(100dvh - 1.5rem)' }}
        >
          <div className="p-3 sm:p-5">
            <div className="flex justify-between items-start mb-4 sm:mb-5">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {mode === 'create' ? 'Nouvelle session' : 'Modifier la session'}
              </h2>

              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
                aria-label="Fermer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

            <div>
              <label htmlFor="members" className="block text-[11px] font-semibold text-slate-300 mb-1.5 sm:text-xs">
                Prénom du membre
              </label>
              <input
                type="text"
                id="members"
                value={formState.members}
                onChange={(e) => setFormState({...formState, members: e.target.value})}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-800 border border-slate-700 rounded-lg text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                placeholder="Anna, Sylvain, ..."
                autoComplete="off"
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="title" className="block text-[11px] font-semibold text-slate-300 mb-1.5 sm:text-xs">
                Titre de la session
              </label>
              <input
                type="text"
                id="title"
                value={formState.title}
                onChange={(e) => setFormState({...formState, title: e.target.value})}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-800 border border-slate-700 rounded-lg text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                placeholder="Session exté avec Michel, ..."
                required
                autoComplete="off"
              />
            </div>

            <div className="flex flex-row flex-wrap gap-2 sm:gap-3">
              <div className="flex-1">
                <label htmlFor="start" className="block text-[11px] font-semibold text-slate-300 mb-1.5 sm:text-xs">
                  Début
                </label>
                <input
                  type="datetime-local"
                  id="start"
                  value={formatDatetimeLocal(formState.start)}
                  onChange={(e) => setFormState({...formState, start: new Date(e.target.value)})}
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-800 border border-slate-700 rounded-lg text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  required
                />
              </div>

              <div className="">
                <label htmlFor="duration" className="block text-[11px] font-semibold text-slate-300 mb-1.5 sm:text-xs">
                  Durée (h)
                </label>
                <input
                  type="number"
                  id="duration"
                  value={formState.duration || ''}
                  onChange={(e) => setFormState({...formState, duration: e.target.value ? Math.min(24, parseFloat(e.target.value)) : 0})}
                  min="0.5"
                  max="24"
                  step="0.25"
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-800 border border-slate-700 rounded-lg text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  required
                />
              </div>
            </div>

            {errorMessage && (
              <p className="text-[11px] sm:text-sm text-red-400">{errorMessage}</p>
            )}

            <div className="pt-1 sm:pt-2">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 hover:text-slate-300 transition-colors sm:text-sm"
              >
                <span>Avancé</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showAdvanced && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-slate-800/50 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.repeat_weekly === 1}
                      onChange={(e) => setFormState({...formState, repeat_weekly: e.target.checked ? 1 : 0})}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 accent-orange-600 focus:ring-2 focus:ring-orange-600 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm text-slate-300">Répéter toutes les semaines</span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex flex-row flex-wrap gap-2 sm:gap-3">
              {mode === 'edit' && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSaving || isDeleting}
                  className="flex-1 min-w-[140px] px-4 py-2.5 sm:px-5 sm:py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold rounded-lg transition duration-200 shadow-lg shadow-red-600/40 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600 flex items-center justify-center gap-2"
                >
                  {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  <span>Supprimer</span>
                </button>
              )}
              <button
                type="submit"
                disabled={!formState.title.trim() || !formState.members.trim() || !formState.start || !formState.duration || formState.duration < 0.5 || isSaving || isDeleting}
                className="flex-1 min-w-[150px] px-4 py-2.5 sm:px-5 sm:py-3 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-semibold rounded-lg transition duration-200 shadow-lg shadow-orange-600/40 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-600 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                <span>{mode === 'create' ? 'Créer' : 'Enregistrer'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  );
}
