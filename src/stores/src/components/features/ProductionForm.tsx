import { useState } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export function ProductionForm() {
  const { products, equipes, addProduction } = useDataStore();
  const currentUser = useAuthStore((s) => s.currentUser);

  const [equipe, setEquipe] = useState('');
  const [produit, setProduit] = useState('');
  const [quantite, setQuantite] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipe || !produit || !quantite || Number(quantite) <= 0) {
      toast.error('Veuillez remplir tous les champs correctement');
      return;
    }
    addProduction({
      equipe_nom: equipe,
      produit_nom: produit,
      quantite: Number(quantite),
      user_email: currentUser?.email ?? '',
    });
    toast.success('Production ajoutée — mouvement de stock créé automatiquement');
    setEquipe('');
    setProduit('');
    setQuantite('');
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Plus className="size-5 text-production" />
          Nouvelle Production
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="equipe">Équipe</Label>
            <select
              id="equipe"
              value={equipe}
              onChange={(e) => setEquipe(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Sélectionner...</option>
              {equipes.map((eq) => (
                <option key={eq.id} value={eq.nom}>{eq.nom}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="produit">Produit</Label>
            <select
              id="produit"
              value={produit}
              onChange={(e) => setProduit(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Sélectionner...</option>
              {products.map((p) => (
                <option key={p.id} value={p.nom}>{p.nom}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantite">Quantité</Label>
            <Input
              id="quantite"
              type="number"
              min="1"
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
              placeholder="Ex: 200"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full bg-production hover:bg-production-dark">
              <Plus className="mr-2 size-4" />
              Enregistrer
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
