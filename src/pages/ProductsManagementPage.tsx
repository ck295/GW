import { useState } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { formatMoney, formatUSD, fcToUsd } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ShoppingCart, Plus, Pencil, Trash2, X, Check, DollarSign, Package, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function ProductsManagementPage() {
  const { products, addProduct, updateProduct, updateProductThresholds, deleteProduct } = useDataStore();
  const { tauxUsdCdf } = useSettingsStore();

  const [newNom, setNewNom] = useState('');
  const [newPrix, setNewPrix] = useState('');
  const [newSeuilBas, setNewSeuilBas] = useState('50');
  const [newSeuilCritique, setNewSeuilCritique] = useState('20');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNom, setEditNom] = useState('');
  const [editPrix, setEditPrix] = useState('');
  const [editSeuilBas, setEditSeuilBas] = useState('');
  const [editSeuilCritique, setEditSeuilCritique] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const nom = newNom.trim();
    const prix = Number(newPrix);
    if (!nom) { toast.error('Le nom du produit est requis'); return; }
    if (!prix || prix <= 0) { toast.error('Le prix doit être supérieur à 0'); return; }
    if (products.some((p) => p.nom.toLowerCase() === nom.toLowerCase())) {
      toast.error('Un produit avec ce nom existe déjà');
      return;
    }
    const sb = Number(newSeuilBas) || 50;
    const sc = Number(newSeuilCritique) || 20;
    if (sc >= sb) { toast.error('Le seuil critique doit être inférieur au seuil bas'); return; }
    addProduct(nom, prix, sb, sc);
    setNewNom('');
    setNewPrix('');
    setNewSeuilBas('50');
    setNewSeuilCritique('20');
    toast.success(`Produit « ${nom} » ajouté`);
  };

  const startEdit = (p: typeof products[0]) => {
    setEditingId(p.id);
    setEditNom(p.nom);
    setEditPrix(String(p.prix));
    setEditSeuilBas(String(p.seuil_bas));
    setEditSeuilCritique(String(p.seuil_critique));
    setDeleteConfirmId(null);
  };

  const handleUpdate = () => {
    if (!editingId) return;
    const nom = editNom.trim();
    const prix = Number(editPrix);
    if (!nom) { toast.error('Le nom est requis'); return; }
    if (!prix || prix <= 0) { toast.error('Le prix doit être supérieur à 0'); return; }
    const existing = products.find((p) => p.nom.toLowerCase() === nom.toLowerCase() && p.id !== editingId);
    if (existing) { toast.error('Un autre produit avec ce nom existe déjà'); return; }
    const sb = Number(editSeuilBas) || 50;
    const sc = Number(editSeuilCritique) || 20;
    if (sc >= sb) { toast.error('Le seuil critique doit être inférieur au seuil bas'); return; }
    updateProduct(editingId, nom, prix);
    updateProductThresholds(editingId, sb, sc);
    setEditingId(null);
    toast.success(`Produit « ${nom} » mis à jour`);
  };

  const handleDelete = (id: string, nom: string) => {
    deleteProduct(id);
    setDeleteConfirmId(null);
    toast.success(`Produit « ${nom} » supprimé`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-livraison/10">
          <ShoppingCart className="size-5 text-livraison" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold">Gestion des Produits</h2>
          <p className="text-sm text-muted-foreground">Ajout, modification et suppression des produits</p>
        </div>
        <Badge variant="secondary" className="ml-auto text-sm">{products.length} produit(s)</Badge>
      </div>

      {/* Add form */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="size-4 text-production" />
            Ajouter un produit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Nom du produit</Label>
                <Input
                  value={newNom}
                  onChange={(e) => setNewNom(e.target.value)}
                  placeholder="Ex: Eau Minérale 1.5L"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Prix unitaire (FC)</Label>
                <Input
                  type="number"
                  min="1"
                  value={newPrix}
                  onChange={(e) => setNewPrix(e.target.value)}
                  placeholder="Ex: 1500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1"><AlertTriangle className="size-3 text-amber-500" /> Seuil bas</Label>
                <Input
                  type="number"
                  min="1"
                  value={newSeuilBas}
                  onChange={(e) => setNewSeuilBas(e.target.value)}
                  placeholder="50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1"><ShieldAlert className="size-3 text-red-500" /> Seuil critique</Label>
                <Input
                  type="number"
                  min="0"
                  value={newSeuilCritique}
                  onChange={(e) => setNewSeuilCritique(e.target.value)}
                  placeholder="20"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" className="bg-production hover:bg-production-dark shrink-0">
                <Plus className="mr-1.5 size-4" />
                Ajouter
              </Button>
              {newPrix && Number(newPrix) > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <DollarSign className="size-3" />
                  ≈ {formatUSD(fcToUsd(Number(newPrix), tauxUsdCdf))}
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Products table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="size-4 text-stock" />
            Liste des produits
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 w-12">#</th>
                  <th className="px-5 py-3">Nom du produit</th>
                  <th className="px-5 py-3 text-right">Prix (FC)</th>
                  <th className="px-5 py-3 text-right">Équiv. USD</th>
                  <th className="px-5 py-3 text-center">Seuils (bas / crit.)</th>
                  <th className="px-5 py-3 text-center w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, idx) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30 group">
                    {editingId === p.id ? (
                      <>
                        <td className="px-5 py-3 text-muted-foreground">{idx + 1}</td>
                        <td className="px-5 py-2">
                          <Input
                            value={editNom}
                            onChange={(e) => setEditNom(e.target.value)}
                            className="h-8 text-sm"
                            autoFocus
                          />
                        </td>
                        <td className="px-5 py-2">
                          <Input
                            type="number"
                            min="1"
                            value={editPrix}
                            onChange={(e) => setEditPrix(e.target.value)}
                            className="h-8 text-sm text-right w-32 ml-auto"
                          />
                        </td>
                        <td className="px-5 py-3 text-right text-xs text-muted-foreground tabular-nums">
                          {editPrix && Number(editPrix) > 0 ? formatUSD(fcToUsd(Number(editPrix), tauxUsdCdf)) : '—'}
                        </td>
                        <td className="px-5 py-2">
                          <div className="flex items-center justify-center gap-1">
                            <Input
                              type="number"
                              min="1"
                              value={editSeuilBas}
                              onChange={(e) => setEditSeuilBas(e.target.value)}
                              className="h-8 text-sm text-center w-16"
                            />
                            <span className="text-muted-foreground/40">/</span>
                            <Input
                              type="number"
                              min="0"
                              value={editSeuilCritique}
                              onChange={(e) => setEditSeuilCritique(e.target.value)}
                              className="h-8 text-sm text-center w-16"
                            />
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <Button size="sm" onClick={handleUpdate} className="h-7 px-2 bg-production hover:bg-production-dark">
                              <Check className="size-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-7 px-2">
                              <X className="size-3.5" />
                            </Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-5 py-3 text-muted-foreground">{idx + 1}</td>
                        <td className="px-5 py-3 font-medium">{p.nom}</td>
                        <td className="px-5 py-3 text-right tabular-nums font-semibold">{formatMoney(p.prix)}</td>
                        <td className="px-5 py-3 text-right text-xs text-muted-foreground tabular-nums">
                          ≈ {formatUSD(fcToUsd(p.prix, tauxUsdCdf))}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-xs">
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-700 tabular-nums">{p.seuil_bas}</span>
                            <span className="text-muted-foreground/40">/</span>
                            <span className="rounded bg-red-100 px-1.5 py-0.5 text-red-700 tabular-nums">{p.seuil_critique}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEdit(p)}
                              className="h-7 px-2 text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            {deleteConfirmId === p.id ? (
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDelete(p.id, p.nom)}
                                  className="h-7 px-2 text-xs"
                                >
                                  Confirmer
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="h-7 px-2"
                                >
                                  <X className="size-3.5" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => { setDeleteConfirmId(p.id); setEditingId(null); }}
                                className="h-7 px-2 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                      Aucun produit. Ajoutez-en un ci-dessus.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
