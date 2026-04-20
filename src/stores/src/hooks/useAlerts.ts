import { useMemo } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { computeStockActuel, getStockLevel } from '@/lib/calculations';
import { formatMoney } from '@/lib/utils';
import { today } from '@/lib/dates';
import type { Alert } from '@/types';

export function useAlerts(): Alert[] {
  const { products, stockMouvements, livraisons, finances } = useDataStore();

  return useMemo(() => {
    const alerts: Alert[] = [];
    const todayStr = today();

    livraisons.forEach((l) => {
      if (l.total_vendu !== l.montant_attendu) {
        alerts.push({
          id: `inc-${l.id}`,
          type: 'error',
          message: `Incohérence ${l.livreur_nom} — ${l.produit_nom}: attendu ${formatMoney(l.montant_attendu)}, déclaré ${formatMoney(l.total_vendu)}`,
          module: 'livraison',
          date: l.date,
        });
      }
    });

    const stock = computeStockActuel(products, stockMouvements);
    stock.forEach((s) => {
      const product = products.find((p) => p.nom === s.produit_nom);
      const seuilBas = product?.seuil_bas ?? 50;
      const seuilCritique = product?.seuil_critique ?? 20;
      const level = getStockLevel(s.quantite, seuilBas, seuilCritique);
      if (level === 'negatif') {
        alerts.push({
          id: `neg-${s.produit_nom}`,
          type: 'error',
          message: `Stock négatif: ${s.produit_nom} (${s.quantite} unités)`,
          module: 'stock',
          date: todayStr,
        });
      } else if (level === 'critique') {
        alerts.push({
          id: `crit-${s.produit_nom}`,
          type: 'error',
          message: `Stock critique: ${s.produit_nom} (${s.quantite}/${seuilCritique} unités)`,
          module: 'stock',
          date: todayStr,
        });
      } else if (level === 'bas') {
        alerts.push({
          id: `low-${s.produit_nom}`,
          type: 'warning',
          message: `Stock bas: ${s.produit_nom} (${s.quantite}/${seuilBas} unités)`,
          module: 'stock',
          date: todayStr,
        });
      }
    });

    const unconfirmed = finances.filter(
      (f) => f.type === 'encaissement' && !f.confirmed && f.date === todayStr
    );
    if (unconfirmed.length > 0) {
      const totalUnconfirmed = unconfirmed.reduce((s, f) => s + f.montant, 0);
      alerts.push({
        id: 'unconfirmed-enc',
        type: 'warning',
        message: `${unconfirmed.length} encaissement(s) en attente de confirmation (${formatMoney(totalUnconfirmed)})`,
        module: 'finance',
        date: todayStr,
      });
    }

    return alerts;
  }, [products, stockMouvements, livraisons, finances]);
}
