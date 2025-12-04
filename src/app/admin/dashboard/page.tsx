'use client';

import { useState, useEffect } from 'react';
import { getPricingData, updatePricingData } from '@/actions/pricingActions';
import { logoutAction } from '@/actions/authActions';
import { PricingData } from '@/lib/types/pricing.d';
import PricingCards from '@/components/PricingCards';

const defaultPricingData: PricingData = {
  services: [],
  footnotes: []
};

export default function AdminDashboardPage() {
  const [jsonValue, setJsonValue] = useState('');
  const [previewData, setPreviewData] = useState<PricingData>(defaultPricingData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadPricing() {
      const data = await getPricingData();
      setJsonValue(JSON.stringify(data, null, 2));
      setPreviewData(data);
      setLoading(false);
    }
    loadPricing();
  }, []);

  useEffect(() => {
    try {
      const parsed = JSON.parse(jsonValue);
      if (parsed.services && Array.isArray(parsed.services)) {
        setPreviewData(parsed);
      }
    } catch {
      // JSON invalide, on garde la preview précédente
    }
  }, [jsonValue]);

  async function handleSave() {
    setShowConfirm(false);
    setSaving(true);
    setMessage(null);
    const result = await updatePricingData(jsonValue);
    if (result.success) {
      setMessage({ type: 'success', text: 'Tarifs mis à jour avec succès' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Erreur inconnue' });
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-white">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Éditer les tarifs</h1>
          <form action={logoutAction}>
            <button
              type="submit"
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition duration-300"
            >
              Déconnexion
            </button>
          </form>
        </div>

        <div className="bg-slate-800 rounded-xl p-6">
          <textarea
            value={jsonValue}
            onChange={(e) => setJsonValue(e.target.value)}
            className="w-full min-h-svh bg-slate-900 text-slate-100 font-mono text-sm p-4 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            spellCheck={false}
          />

          {message && (
            <p className={`mt-4 text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {message.text}
            </p>
          )}

          <button
            onClick={() => setShowConfirm(true)}
            disabled={saving}
            className="mt-4 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>

        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-6 rounded-xl max-w-md mx-4">
              <h2 className="text-xl font-bold text-white mb-4">Confirmer les modifications</h2>
              <p className="text-slate-300 mb-6">
                Les modifications seront <strong className="text-orange-400">instantanément visibles</strong> sur le site public.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8 text-orange-500">Prévisualisation :</h2>
        <div className="bg-slate-950 py-10 px-8 md:px-20 container mx-auto">
          <PricingCards services={previewData.services} footnotes={previewData.footnotes || []} isPreview />
        </div>
      </div>
    </div>
  );
}
