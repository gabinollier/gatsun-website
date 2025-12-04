'use server';

import pool from '@/lib/db';
import { verifySession } from '@/lib/auth';
import { PricingData } from '@/lib/types/pricing.d';

const defaultPricingData: PricingData = {
  services: [],
  footnotes: []
};

export async function getPricingData(): Promise<PricingData> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT value FROM site_settings WHERE key = 'pricing_data'`
    );
    if (result.rows.length === 0) {
      return defaultPricingData;
    }
    return result.rows[0].value as PricingData;
  } finally {
    client.release();
  }
}

export async function updatePricingData(jsonString: string): Promise<{ success: boolean; error?: string }> {
  const isAuthenticated = await verifySession();
  if (!isAuthenticated) {
    return { success: false, error: 'Non autorisé' };
  }

  let data: PricingData;
  try {
    data = JSON.parse(jsonString);
  } catch {
    return { success: false, error: 'JSON invalide' };
  }

  if (!data.services || !Array.isArray(data.services)) {
    return { success: false, error: 'Le JSON doit contenir un tableau "services"' };
  }

  if (!data.footnotes || !Array.isArray(data.footnotes)) {
    return { success: false, error: 'Le JSON doit contenir un tableau "footnotes"' };
  }

  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE site_settings SET value = $1 WHERE key = 'pricing_data'`,
      [JSON.stringify(data)]
    );
    return { success: true };
  } catch (error) {
    console.error('Error updating pricing data:', error);
    return { success: false, error: 'Erreur lors de la mise à jour' };
  } finally {
    client.release();
  }
}
