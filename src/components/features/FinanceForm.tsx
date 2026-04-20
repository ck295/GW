import { useState } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Wallet, Plus } from 'lucide-react';

export function FinanceForm() {
  const addFinance = useDataStore((s) => s.addFinance);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [type, setType] = useState<'encaissement' | 'depense'>('depense');
  const [montant, setMontant] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!montant || Number(montant) <= 0 || !description.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    addFinance({
      type,
      montant: Number(montant),
      description: description.trim(),
      user_email: currentUser?.email ?? '',
      confirmed: true,
    });
    toast.success(type === 'encaissement' ? 'Encaissement enregistré' : 'Dépense enregistrée');
    setMontant('');
    setDescription('');
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wallet className="size-5 text-finance" />
          Nouvelle Opération
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="space-y-2">
            <Label>Type d'opération</Label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'encaissement' | 'depense')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="encaissement">Encaissement</option>
              <option value="depense">Dépense</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Montant (FC)</Label>
            <Input type="number" min="1" value={montant} onChange={(e) => setMontant(e.target.value)} placeholder="Ex: 50000" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Motif de l'opération" />
          </div>
          <Button type="submit" className="bg-finance hover:bg-finance-dark">
            <Plus className="mr-2 size-4" />
            Enregistrer
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
