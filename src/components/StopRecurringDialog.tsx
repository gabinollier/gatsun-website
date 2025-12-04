'use client';

type StopRecurringDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onChoice: (choice: 'this' | 'initial') => void;
};

export default function StopRecurringDialog({
  isOpen,
  onClose,
  onChoice,
}: StopRecurringDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex min-h-dvh items-start sm:items-center justify-center px-3 py-4 sm:px-4 sm:py-6 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-100/10 w-full max-w-lg"
          style={{ maxHeight: 'calc(100dvh - 1.5rem)' }}
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4 sm:mb-5">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Arrêter la récurrence
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
                aria-label="Fermer"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <p className="text-sm sm:text-base text-slate-300 mb-6">
              Quelle occurrence voulez-vous conserver ? Toutes les autres
              occurrences seront supprimées.
            </p>
            <div className="flex flex-row flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => onChoice('this')}
                className="flex-1 min-w-[140px] px-4 py-2.5 sm:px-5 sm:py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-semibold rounded-lg transition duration-200 shadow-lg shadow-slate-900/40 text-sm sm:text-base"
              >
                Cette occurrence
              </button>
              <button
                onClick={() => onChoice('initial')}
                className="flex-1 min-w-[150px] px-4 py-2.5 sm:px-5 sm:py-3 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-semibold rounded-lg transition duration-200 shadow-lg shadow-orange-600/40 text-sm sm:text-base"
              >
                L&apos;occurrence initiale
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
