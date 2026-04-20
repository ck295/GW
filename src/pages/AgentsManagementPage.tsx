import { useState } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Users, Factory, Truck, Plus, Pencil, Trash2, X, Check } from 'lucide-react';

export default function AgentsManagementPage() {
  const {
    equipes, livreurs,
    addEquipe, updateEquipe, deleteEquipe,
    addLivreur, updateLivreur, deleteLivreur,
  } = useDataStore();

  // Equipe form
  const [newEquipeNom, setNewEquipeNom] = useState('');
  const [editEquipeId, setEditEquipeId] = useState<string | null>(null);
  const [editEquipeNom, setEditEquipeNom] = useState('');
  const [deleteEquipeConfirm, setDeleteEquipeConfirm] = useState<string | null>(null);

  // Livreur form
  const [newLivreurNom, setNewLivreurNom] = useState('');
  const [newLivreurVehicule, setNewLivreurVehicule] = useState('');
  const [editLivreurId, setEditLivreurId] = useState<string | null>(null);
  const [editLivreurNom, setEditLivreurNom] = useState('');
  const [editLivreurVehicule, setEditLivreurVehicule] = useState('');
  const [deleteLivreurConfirm, setDeleteLivreurConfirm] = useState<string | null>(null);

  // Equipe handlers
  const handleAddEquipe = (e: React.FormEvent) => {
    e.preventDefault();
    const nom = newEquipeNom.trim();
    if (!nom) { toast.error('Le nom de l\'équipe est requis'); return; }
    if (equipes.some((eq) => eq.nom.toLowerCase() === nom.toLowerCase())) {
      toast.error('Une équipe avec ce nom existe déjà'); return;
    }
    addEquipe(nom);
    setNewEquipeNom('');
    toast.success(`Équipe « ${nom} » ajoutée`);
  };

  const handleUpdateEquipe = () => {
    if (!editEquipeId) return;
    const nom = editEquipeNom.trim();
    if (!nom) { toast.error('Le nom est requis'); return; }
    const existing = equipes.find((eq) => eq.nom.toLowerCase() === nom.toLowerCase() && eq.id !== editEquipeId);
    if (existing) { toast.error('Une autre équipe avec ce nom existe déjà'); return; }
    updateEquipe(editEquipeId, nom);
    setEditEquipeId(null);
    toast.success(`Équipe « ${nom} » mise à jour`);
  };

  const handleDeleteEquipe = (id: string, nom: string) => {
    deleteEquipe(id);
    setDeleteEquipeConfirm(null);
    toast.success(`Équipe « ${nom} » supprimée`);
  };

  // Livreur handlers
  const handleAddLivreur = (e: React.FormEvent) => {
    e.preventDefault();
    const nom = newLivreurNom.trim();
    const vehicule = newLivreurVehicule.trim();
    if (!nom) { toast.error('Le nom du livreur est requis'); return; }
    if (!vehicule) { toast.error('Le véhicule est requis'); return; }
    if (livreurs.some((l) => l.nom.toLowerCase() === nom.toLowerCase())) {
      toast.error('Un livreur avec ce nom existe déjà'); return;
    }
    addLivreur(nom, vehicule);
    setNewLivreurNom('');
    setNewLivreurVehicule('');
    toast.success(`Livreur « ${nom} » ajouté`);
  };

  const handleUpdateLivreur = () => {
    if (!editLivreurId) return;
    const nom = editLivreurNom.trim();
    const vehicule = editLivreurVehicule.trim();
    if (!nom) { toast.error('Le nom est requis'); return; }
    if (!vehicule) { toast.error('Le véhicule est requis'); return; }
    const existing = livreurs.find((l) => l.nom.toLowerCase() === nom.toLowerCase() && l.id !== editLivreurId);
    if (existing) { toast.error('Un autre livreur avec ce nom existe déjà'); return; }
    updateLivreur(editLivreurId, nom, vehicule);
    setEditLivreurId(null);
    toast.success(`Livreur « ${nom} » mis à jour`);
  };

  const handleDeleteLivreur = (id: string, nom: string) => {
    deleteLivreur(id);
    setDeleteLivreurConfirm(null);
    toast.success(`Livreur « ${nom} » supprimé`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-teal-500/10">
          <Users className="size-5 text-teal-500" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold">Gestion des Agents</h2>
          <p className="text-sm text-muted-foreground">Équipes de production et agents livreurs</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* EQUIPES */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Factory className="size-4 text-production" />
                Ajouter une équipe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddEquipe} className="flex gap-3 items-end">
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs">Nom de l'équipe</Label>
                  <Input
                    value={newEquipeNom}
                    onChange={(e) => setNewEquipeNom(e.target.value)}
                    placeholder="Ex: Équipe Matin"
                  />
                </div>
                <Button type="submit" className="bg-production hover:bg-production-dark shrink-0">
                  <Plus className="mr-1.5 size-4" />
                  Ajouter
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <Factory className="size-4 text-production" />
                  Équipes de production
                </span>
                <Badge variant="secondary" className="text-xs">{equipes.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      <th className="px-5 py-3 w-12">#</th>
                      <th className="px-5 py-3">Nom de l'équipe</th>
                      <th className="px-5 py-3 text-center w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipes.map((eq, idx) => (
                      <tr key={eq.id} className="border-b last:border-0 hover:bg-muted/30 group">
                        {editEquipeId === eq.id ? (
                          <>
                            <td className="px-5 py-3 text-muted-foreground">{idx + 1}</td>
                            <td className="px-5 py-2">
                              <Input
                                value={editEquipeNom}
                                onChange={(e) => setEditEquipeNom(e.target.value)}
                                className="h-8 text-sm"
                                autoFocus
                              />
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center justify-center gap-1">
                                <Button size="sm" onClick={handleUpdateEquipe} className="h-7 px-2 bg-production hover:bg-production-dark">
                                  <Check className="size-3.5" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditEquipeId(null)} className="h-7 px-2">
                                  <X className="size-3.5" />
                                </Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-5 py-3 text-muted-foreground">{idx + 1}</td>
                            <td className="px-5 py-3 font-medium">{eq.nom}</td>
                            <td className="px-5 py-3">
                              <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => { setEditEquipeId(eq.id); setEditEquipeNom(eq.nom); setDeleteEquipeConfirm(null); }}
                                  className="h-7 px-2 text-muted-foreground hover:text-foreground"
                                >
                                  <Pencil className="size-3.5" />
                                </Button>
                                {deleteEquipeConfirm === eq.id ? (
                                  <div className="flex items-center gap-1">
                                    <Button size="sm" variant="destructive" onClick={() => handleDeleteEquipe(eq.id, eq.nom)} className="h-7 px-2 text-xs">
                                      Oui
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setDeleteEquipeConfirm(null)} className="h-7 px-2">
                                      <X className="size-3.5" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => { setDeleteEquipeConfirm(eq.id); setEditEquipeId(null); }}
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
                    {equipes.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-5 py-8 text-center text-muted-foreground">
                          Aucune équipe.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* LIVREURS */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="size-4 text-livraison" />
                Ajouter un livreur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddLivreur} className="space-y-3">
                <div className="flex gap-3 items-end">
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-xs">Nom du livreur</Label>
                    <Input
                      value={newLivreurNom}
                      onChange={(e) => setNewLivreurNom(e.target.value)}
                      placeholder="Ex: Amadou Diallo"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-xs">Véhicule affecté</Label>
                    <Input
                      value={newLivreurVehicule}
                      onChange={(e) => setNewLivreurVehicule(e.target.value)}
                      placeholder="Ex: Camion A-1204"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-livraison hover:bg-livraison-dark">
                  <Plus className="mr-1.5 size-4" />
                  Ajouter le livreur
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <Truck className="size-4 text-livraison" />
                  Agents livreurs
                </span>
                <Badge variant="secondary" className="text-xs">{livreurs.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      <th className="px-5 py-3 w-12">#</th>
                      <th className="px-5 py-3">Nom</th>
                      <th className="px-5 py-3">Véhicule</th>
                      <th className="px-5 py-3 text-center w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {livreurs.map((lv, idx) => (
                      <tr key={lv.id} className="border-b last:border-0 hover:bg-muted/30 group">
                        {editLivreurId === lv.id ? (
                          <>
                            <td className="px-5 py-3 text-muted-foreground">{idx + 1}</td>
                            <td className="px-5 py-2">
                              <Input
                                value={editLivreurNom}
                                onChange={(e) => setEditLivreurNom(e.target.value)}
                                className="h-8 text-sm"
                                autoFocus
                              />
                            </td>
                            <td className="px-5 py-2">
                              <Input
                                value={editLivreurVehicule}
                                onChange={(e) => setEditLivreurVehicule(e.target.value)}
                                className="h-8 text-sm"
                              />
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center justify-center gap-1">
                                <Button size="sm" onClick={handleUpdateLivreur} className="h-7 px-2 bg-livraison hover:bg-livraison-dark">
                                  <Check className="size-3.5" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditLivreurId(null)} className="h-7 px-2">
                                  <X className="size-3.5" />
                                </Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-5 py-3 text-muted-foreground">{idx + 1}</td>
                            <td className="px-5 py-3 font-medium">{lv.nom}</td>
                            <td className="px-5 py-3">
                              <Badge variant="outline" className="text-xs font-normal">{lv.vehicule}</Badge>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditLivreurId(lv.id);
                                    setEditLivreurNom(lv.nom);
                                    setEditLivreurVehicule(lv.vehicule);
                                    setDeleteLivreurConfirm(null);
                                  }}
                                  className="h-7 px-2 text-muted-foreground hover:text-foreground"
                                >
                                  <Pencil className="size-3.5" />
                                </Button>
                                {deleteLivreurConfirm === lv.id ? (
                                  <div className="flex items-center gap-1">
                                    <Button size="sm" variant="destructive" onClick={() => handleDeleteLivreur(lv.id, lv.nom)} className="h-7 px-2 text-xs">
                                      Oui
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setDeleteLivreurConfirm(null)} className="h-7 px-2">
                                      <X className="size-3.5" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => { setDeleteLivreurConfirm(lv.id); setEditLivreurId(null); }}
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
                    {livreurs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                          Aucun livreur.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
