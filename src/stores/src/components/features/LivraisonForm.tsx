import { useState, useMemo } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Truck, AlertTriangle, Info } from 'lucide-react';
import { formatMoney, formatUSD, fcToUsd } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settingsStore';

export function LivraisonForm() {
  const { products, livreurs, addLivraison } = useDataStore();
  const { tauxUsdCdf: TAUX_USD_CDF } = useSettingsStore();
  const currentUser = useAuthStore((s) => s.currentUser);

  const [livreur, setLivreur] = useState('');
  const [produit, setProduit] = useState('');
  const [sortie, setSortie] = useState('');
  const [retour, setRetour] = useState('');
  const [bonus, setBonus] = useState('');
  const [cash, setCash] = useState('');
  const [credit, setCredit] = useState('');
  const [recouv, setRecouv] = useState('');

  const prix = products.find((p) => p.nom === produit)?.prix ?? 0;

  const computed = useMemo(() => {
    const s = Number(sortie) || 0;
    const r = Number(retour) || 0;
    const b = Number(bonus) || 0;
    const vente = s - r - b;
    const montant_attendu = vente * prix;
    const total_vendu = (Number(cash) || 0) + (Number(credit) || 0);
    const coherent = total_vendu === montant_attendu;
    return { vente, montant_attendu, total_vendu, coherent, retourValid: r <= s };
  }, [sortie, retour, bonus, cash, credit, prix]);

  const resetForm = () => {
    setLivreur(''); setProduit(''); setSortie(''); setRetour('');
    setBonus(''); setCash(''); setCredit(''); setRecouv('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!livreur || !produit || !sortie) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }
    if (!computed.retourValid) {
      toast.error('Le retour ne peut pas dépasser la sortie');
      return;
    }
    addLivraison({
      livreur_nom: livreur,
      produit_nom: produit,
      sortie: Number(sortie),
      retour: Number(retour) || 0,
      bonus: Number(bonus) || 0,
      ventes_cash: Number(cash) || 0,
      ventes_credit: Number(credit) || 0,
      recouvrements: Number(recouv) || 0,
      user_email: currentUser?.email ?? '',
    });
    if (!computed.coherent) {
      toast.warning('Livraison enregistrée avec une incohérence financière');
    } else {
      toast.success('Livraison enregistrée — stock et finance mis à jour');
    }
    resetForm();
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Truck className="size-5 text-livraison" />
          Nouvelle Livraison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Livreur</Label>
              <select value={livreur} onChange={(e) => setLivreur(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">Sélectionner...</option>
                {livreurs.map((l) => (<option key={l.id} value={l.nom}>{l.nom} ({l.vehicule})</option>))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Produit</Label>
              <select value={produit} onChange={(e) => setProduit(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">Sélectionner...</option>
                {products.map((p) => (<option key={p.id} value={p.nom}>{p.nom} — {formatMoney(p.prix)}</option>))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Sortie</Label>
              <Input type="number" min="0" value={sortie} onChange={(e) => setSortie(e.target.value)} placeholder="Qté sortie" />
            </div>
            <div className="space-y-2">
              <Label>Retour</Label>
              <Input type="number" min="0" value={retour} onChange={(e) => setRetour(e.target.value)} placeholder="Qté retour" />
              {!computed.retourValid && <p className="flex items-center gap-1 text-xs text-destructive"><AlertTriangle className="size-3" />Retour &gt; Sortie</p>}
            </div>
            <div className="space-y-2">
              <Label>Bonus</Label>
              <Input type="number" min="0" value={bonus} onChange={(e) => setBonus(e.target.value)} placeholder="Qté bonus" />
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-livraison/40 bg-livraison-light/50 p-3">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="font-medium text-livraison-dark">Vente calculée : <span className="font-bold">{computed.vente}</span></span>
              <span className="font-medium text-livraison-dark">Montant attendu : <span className="font-bold">{formatMoney(computed.montant_attendu)}</span> <span className="text-xs opacity-70">≈ {formatUSD(fcToUsd(computed.montant_attendu, TAUX_USD_CDF))}</span></span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Ventes Cash (FC)</Label>
              <Input type="number" min="0" value={cash} onChange={(e) => setCash(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Ventes Crédit (FC)</Label>
              <Input type="number" min="0" value={credit} onChange={(e) => setCredit(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Recouvrements (FC)</Label>
              <Input type="number" min="0" value={recouv} onChange={(e) => setRecouv(e.target.value)} placeholder="0" />
            </div>
          </div>

          {!computed.coherent && computed.total_vendu > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-300/50 bg-amber-50 p-3 text-sm text-amber-700">
              <Info className="size-4 shrink-0" />
              <span>Info : cash + crédit ({formatMoney(computed.total_vendu)}) ≠ montant attendu ({formatMoney(computed.montant_attendu)}) — écart de <strong>{formatMoney(Math.abs(computed.total_vendu - computed.montant_attendu))}</strong></span>
            </div>
          )}

          <Button type="submit" className="w-full bg-livraison text-white hover:bg-livraison-dark sm:w-auto">
            <Truck className="mr-2 size-4" />
            Enregistrer la livraison
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
