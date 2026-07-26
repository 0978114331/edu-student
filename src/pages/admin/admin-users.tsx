import { useEffect, useState } from 'react';
import { supabase, type UserProfile } from '@/lib/supabase';
import { useI18n } from '@/hooks/use-i18n';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Search, Shield, Crown, User as UserIcon, GraduationCap, Eye } from 'lucide-react';

const ROLES = [
  { value: 'super_admin', label: 'Super Admin', icon: Crown, color: 'bg-destructive/10 text-destructive' },
  { value: 'admin', label: 'Admin', icon: Shield, color: 'bg-primary/10 text-primary' },
  { value: 'editor', label: 'Editor', icon: Eye, color: 'bg-accent/10 text-accent' },
  { value: 'student', label: 'Student', icon: GraduationCap, color: 'bg-muted text-muted-foreground' },
  { value: 'guest', label: 'Guest', icon: UserIcon, color: 'bg-muted text-muted-foreground' },
];

function roleBadge(role: string) {
  const r = ROLES.find((x) => x.value === role) || ROLES[3];
  return { ...r, icon: r.icon };
}

export function AdminUsers() {
  const { t } = useI18n();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) {
      toast.error(error.message);
    } else {
      setUsers((data as UserProfile[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter(
    (u) => !query || (u.email || '').toLowerCase().includes(query.toLowerCase()) || (u.full_name || '').toLowerCase().includes(query.toLowerCase()),
  );

  const changeRole = async (uid: string, role: string) => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', uid);
    if (error) toast.error(error.message);
    else { toast.success('Role updated.'); load(); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('admin.users')}</h1>
        <p className="text-muted-foreground text-sm">{t('admin.usersDesc')}</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('admin.searchUsers')} className="pl-10" />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-3">{Array.from({ length: 5 }).map((_, i) => (<div key={i} className="h-12 rounded shimmer" />))}</div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">{t('admin.noUsers')}</p>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((u) => {
                const rb = roleBadge(u.role);
                const Icon = rb.icon;
                return (
                  <div key={u.id} className="flex items-center gap-3 p-3 hover:bg-muted/30">
                    <Avatar className="h-10 w-10">
                      {u.avatar_url ? <AvatarImage src={u.avatar_url} alt={u.full_name || u.email || ''} /> : null}
                      <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                        {(u.full_name || u.email || 'U')[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{u.full_name || u.email}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${rb.color}`}>
                          <Icon className="h-3 w-3" /> {rb.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</p>
                    </div>
                    <Select value={u.role} onValueChange={(v) => changeRole(u.id, v)}>
                      <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (<SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
