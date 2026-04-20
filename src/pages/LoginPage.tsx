import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useDataStore } from '@/stores/dataStore';
import { ROLE_DEFAULT_ROUTES, ROLE_LABELS } from '@/constants/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Hexagon, LogIn } from 'lucide-react';
import heroImg from '@/assets/hero-login.jpg';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const login = useAuthStore((s) => s.login);
  const users = useDataStore((s) => s.users);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Veuillez sélectionner un utilisateur');
      return;
    }
    const success = login(email, users);
    if (success) {
      const user = users.find((u) => u.email === email);
      if (user) {
        toast.success(`Bienvenue, ${user.nom}`);
        navigate(ROLE_DEFAULT_ROUTES[user.role]);
      }
    } else {
      const user = users.find((u) => u.email === email);
      if (user && !user.active) {
        toast.error('Ce compte est désactivé. Contactez un administrateur.');
      } else {
        toast.error('Utilisateur non reconnu');
      }
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-[55%] lg:block">
        <img src={heroImg} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-navy/90 via-navy/80 to-teal-900/70" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <Hexagon className="size-10 text-teal-400" strokeWidth={2.5} />
            <span className="font-display text-2xl font-bold text-white">PilotFlow</span>
          </div>
          <div className="max-w-lg">
            <h1 className="font-display text-4xl font-extrabold leading-tight text-white text-balance">
              Gestion intégrée de votre activité
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-teal-100/80 text-pretty">
              Production, stock, livraison et finance — suivez chaque mouvement avec des contrôles automatiques et un dashboard de pilotage en temps réel.
            </p>
          </div>
          <div className="flex gap-6 text-sm text-teal-200/60">
            <span>Production</span>
            <span>·</span>
            <span>Stock</span>
            <span>·</span>
            <span>Livraison</span>
            <span>·</span>
            <span>Finance</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <Hexagon className="size-8 text-teal-600" strokeWidth={2.5} />
            <span className="font-display text-xl font-bold">GRAA WATER</span>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-display text-xl">Connexion</CardTitle>
              <CardDescription>Sélectionnez votre profil pour accéder à l'application</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="user-select">Utilisateur</Label>
                  <select
                    id="user-select"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    
                    <option value="">Choisir un utilisateur...</option>
                    {users.filter((u) => u.active).map((u) =>
                    <option key={u.email} value={u.email}>
                        {u.nom} — {ROLE_LABELS[u.role]}
                      </option>
                    )}
                  </select>
                </div>

                <Button type="submit" className="h-11 w-full gap-2" size="lg">
                  <LogIn className="size-4" />
                  Se connecter
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 rounded-lg border bg-card p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rôles disponibles</p>
            <div className="grid grid-cols-2 gap-1.5 text-xs text-muted-foreground">
              <span><strong className="text-production">Admin</strong> — Accès complet</span>
              <span><strong className="text-production">Production</strong> — Saisie production</span>
              <span><strong className="text-stock">Stock</strong> — Lecture stock</span>
              <span><strong className="text-livraison">Livraison</strong> — Saisie livraison</span>
              <span className="col-span-2"><strong className="text-finance">Finance</strong> — Gestion finance</span>
            </div>
          </div>
        </div>
      </div>
    </div>);

}