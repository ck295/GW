import { useState } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { useAuthStore } from '@/stores/authStore';
import { ROLE_LABELS } from '@/constants/config';
import type { UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  UserCog, Plus, Pencil, X, Check, ShieldCheck, ShieldOff,
  Mail, UserCircle, Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ALL_ROLES: UserRole[] = ['ADMIN', 'PRODUCTION', 'STOCK', 'LIVRAISON', 'FINANCE'];

const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: 'bg-teal-100 text-teal-800 border-teal-200',
  PRODUCTION: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  STOCK: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  LIVRAISON: 'bg-amber-100 text-amber-800 border-amber-200',
  FINANCE: 'bg-violet-100 text-violet-800 border-violet-200',
};

export default function UsersManagementPage() {
  const { users, addUser, updateUserRole, updateUserNom, toggleUserActive } = useDataStore();
  const currentUser = useAuthStore((s) => s.currentUser);

  // Add form
  const [newEmail, setNewEmail] = useState('');
  const [newNom, setNewNom] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('PRODUCTION');

  // Edit state
  const [editEmail, setEditEmail] = useState<string | null>(null);
  const [editNom, setEditNom] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('PRODUCTION');

  // Filter
  const [filterRole, setFilterRole] = useState<UserRole | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter((u) => {
    const matchRole = filterRole === 'ALL' || u.role === filterRole;
    const matchSearch =
      !search ||
      u.nom.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const activeCount = users.filter((u) => u.active).length;
  const inactiveCount = users.filter((u) => !u.active).length;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const email = newEmail.trim().toLowerCase();
    const nom = newNom.trim();
    if (!email) { toast.error('L\'email est requis'); return; }
    if (!nom) { toast.error('Le nom est requis'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error('Email invalide'); return; }
    if (users.some((u) => u.email.toLowerCase() === email)) {
      toast.error('Un utilisateur avec cet email existe déjà'); return;
    }
    addUser(email, nom, newRole);
    setNewEmail('');
    setNewNom('');
    setNewRole('PRODUCTION');
    toast.success(`Utilisateur « ${nom} » ajouté avec le rôle ${ROLE_LABELS[newRole]}`);
  };

  const startEdit = (u: typeof users[0]) => {
    setEditEmail(u.email);
    setEditNom(u.nom);
    setEditRole(u.role);
  };

  const handleUpdate = () => {
    if (!editEmail) return;
    const nom = editNom.trim();
    if (!nom) { toast.error('Le nom est requis'); return; }
    updateUserNom(editEmail, nom);
    updateUserRole(editEmail, editRole);
    toast.success(`Utilisateur « ${nom} » mis à jour`);
    setEditEmail(null);
  };

  const handleToggleActive = (email: string, nom: string, currentlyActive: boolean) => {
    if (email === currentUser?.email) {
      toast.error('Vous ne pouvez pas désactiver votre propre compte');
      return;
    }
    toggleUserActive(email);
    toast.success(
      currentlyActive
        ? `Compte « ${nom} » désactivé`
        : `Compte « ${nom} » réactivé`
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-teal-500/10">
          <UserCog className="size-5 text-teal-500" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold">Gestion des Utilisateurs</h2>
          <p className="text-sm text-muted-foreground">Ajout, rôles et activation des comptes</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Badge variant="secondary" className="text-xs">
            <ShieldCheck className="mr-1 size-3" />
            {activeCount} actif(s)
          </Badge>
          {inactiveCount > 0 && (
            <Badge variant="outline" className="text-xs text-destructive border-destructive/30">
              <ShieldOff className="mr-1 size-3" />
              {inactiveCount} inactif(s)
            </Badge>
          )}
        </div>
      </div>

      {/* Add form */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="size-4 text-production" />
            Ajouter un utilisateur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1">
                  <Mail className="size-3" /> Email
                </Label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="utilisateur@pilotflow.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1">
                  <UserCircle className="size-3" /> Nom complet
                </Label>
                <Input
                  value={newNom}
                  onChange={(e) => setNewNom(e.target.value)}
                  placeholder="Ex: Jean Mukendi"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1">
                  <Shield className="size-3" /> Rôle
                </Label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {ALL_ROLES.map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
              </div>
            </div>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
              <Plus className="mr-1.5 size-4" />
              Ajouter l'utilisateur
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou email…"
          className="w-full sm:w-64"
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterRole('ALL')}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium border transition-colors',
              filterRole === 'ALL'
                ? 'bg-foreground text-background border-foreground'
                : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
            )}
          >
            Tous ({users.length})
          </button>
          {ALL_ROLES.map((r) => {
            const count = users.filter((u) => u.role === r).length;
            return (
              <button
                key={r}
                onClick={() => setFilterRole(r)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium border transition-colors',
                  filterRole === r
                    ? ROLE_COLORS[r]
                    : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                )}
              >
                {ROLE_LABELS[r]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Users table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 w-12">#</th>
                  <th className="px-5 py-3">Nom</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Rôle</th>
                  <th className="px-5 py-3 text-center">Statut</th>
                  <th className="px-5 py-3 text-center w-40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, idx) => (
                  <tr
                    key={u.email}
                    className={cn(
                      'border-b last:border-0 group transition-colors',
                      !u.active && 'bg-destructive/5 opacity-70',
                      u.active && 'hover:bg-muted/30'
                    )}
                  >
                    {editEmail === u.email ? (
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
                        <td className="px-5 py-3 text-muted-foreground text-xs">{u.email}</td>
                        <td className="px-5 py-2">
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value as UserRole)}
                            className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {ALL_ROLES.map((r) => (
                              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <Badge variant={u.active ? 'default' : 'destructive'} className="text-[10px]">
                            {u.active ? 'Actif' : 'Inactif'}
                          </Badge>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <Button size="sm" onClick={handleUpdate} className="h-7 px-2 bg-teal-600 hover:bg-teal-700">
                              <Check className="size-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditEmail(null)} className="h-7 px-2">
                              <X className="size-3.5" />
                            </Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-5 py-3 text-muted-foreground">{idx + 1}</td>
                        <td className="px-5 py-3 font-medium">
                          {u.nom}
                          {u.email === currentUser?.email && (
                            <span className="ml-2 text-[10px] text-teal-600 font-semibold">(Vous)</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground text-xs">{u.email}</td>
                        <td className="px-5 py-3">
                          <Badge variant="outline" className={cn('text-[10px] font-medium', ROLE_COLORS[u.role])}>
                            {ROLE_LABELS[u.role]}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <Badge
                            variant={u.active ? 'default' : 'destructive'}
                            className={cn(
                              'text-[10px]',
                              u.active && 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                            )}
                          >
                            {u.active ? 'Actif' : 'Inactif'}
                          </Badge>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEdit(u)}
                              className="h-7 px-2 text-muted-foreground hover:text-foreground"
                              title="Modifier"
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleActive(u.email, u.nom, u.active)}
                              className={cn(
                                'h-7 px-2',
                                u.active
                                  ? 'text-muted-foreground hover:text-destructive'
                                  : 'text-muted-foreground hover:text-emerald-600'
                              )}
                              title={u.active ? 'Désactiver' : 'Réactiver'}
                            >
                              {u.active ? <ShieldOff className="size-3.5" /> : <ShieldCheck className="size-3.5" />}
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                      Aucun utilisateur trouvé.
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
