import { useEffect, useState, type ReactNode } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Shield,
  LayoutGrid,
  Wrench,
  BookOpen,
  Users,
  ShoppingCart,
  Plus,
  Pencil,
  Trash2,
  X,
  DollarSign,
  TrendingUp,
  Loader2,
  Star,
  FileText,
  Save,
} from 'lucide-react';
import type { AITool, Resource, Profile, Purchase, Testimonial, SiteContentRow } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LanguageContext';
import { useSiteContent } from '@/context/SiteContentContext';
import { TOOL_CATEGORIES, RESOURCE_TYPES, getToolIcon, TOOL_ICONS } from '@/data/catalog';

type Tab = 'overview' | 'tools' | 'resources' | 'users' | 'purchases' | 'testimonials' | 'content';

export default function AdminDashboardPage() {
  const { session, profile, loading } = useAuth();
  const { t } = useLang();
  const [tab, setTab] = useState<Tab>('overview');
  const [tools, setTools] = useState<AITool[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Admin code verification
  const [codeVerified, setCodeVerified] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeVerifying, setCodeVerifying] = useState(false);

  // Change admin code
  const [newCode, setNewCode] = useState('');
  const [codeChangeMsg, setCodeChangeMsg] = useState<string | null>(null);

  // Edit modals
  const [editingTool, setEditingTool] = useState<AITool | null>(null);
  const [showToolModal, setShowToolModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);

  // Content management
  const { content, refresh: refreshContent } = useSiteContent();
  const [contentSaving, setContentSaving] = useState(false);
  const [contentMsg, setContentMsg] = useState<string | null>(null);
  const [contentSection, setContentSection] = useState<string>('hero');

  useEffect(() => {
    if (!session?.user || profile?.role !== 'admin') return;
    setDataLoading(true);
    Promise.all([
      supabase.from('ai_tools').select('*').order('created_at', { ascending: false }),
      supabase.from('resources').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('purchases').select('*').order('created_at', { ascending: false }),
      supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
    ]).then(([toolsRes, resRes, usersRes, purRes, testRes]) => {
      setTools((toolsRes.data as AITool[]) ?? []);
      setResources((resRes.data as Resource[]) ?? []);
      setUsers((usersRes.data as Profile[]) ?? []);
      setPurchases((purRes.data as Purchase[]) ?? []);
      setTestimonials((testRes.data as Testimonial[]) ?? []);
      setDataLoading(false);
    });
  }, [session, profile]);

  if (loading) {
    return (
      <div className="pt-16 section py-20">
        <div className="card p-8 h-96 animate-pulse" />
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace />;
  if (profile?.role !== 'admin') {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <Shield className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold">{t('admin.accessDenied')}</h2>
          <Link to="/dashboard" className="btn-primary mt-4">
            {t('nav.dashboard')}
          </Link>
        </div>
      </div>
    );
  }

  // Admin code verification gate
  if (!codeVerified) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="card p-8 max-w-md w-full">
          <div className="grid place-items-center w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-500 to-brand-500 text-white mx-auto mb-4">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-center">{t('admin.code.title')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-1">{t('admin.code.desc')}</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setCodeVerifying(true);
              setCodeError(null);
              const { data } = await supabase.rpc('verify_admin_code', { input_code: codeInput });
              setCodeVerifying(false);
              if (data) {
                setCodeVerified(true);
              } else {
                setCodeError(t('admin.code.invalid'));
              }
            }}
            className="mt-6 space-y-4"
          >
            <input
              required
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder={t('admin.code.placeholder')}
              className="input text-center font-mono"
              autoFocus
            />
            {codeError && (
              <div className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-lg p-3 text-center">
                {codeError}
              </div>
            )}
            <button type="submit" disabled={codeVerifying} className="btn-primary w-full">
              {codeVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : t('admin.code.verify')}
            </button>
          </form>
          <Link to="/dashboard" className="btn-ghost w-full mt-2">
            {t('nav.dashboard')}
          </Link>
        </div>
      </div>
    );
  }

  const totalRevenue = purchases
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const tabs: { key: Tab; label: string; icon: typeof Shield }[] = [
    { key: 'overview', label: t('admin.overview'), icon: LayoutGrid },
    { key: 'tools', label: t('admin.tools'), icon: Wrench },
    { key: 'resources', label: t('admin.resources'), icon: BookOpen },
    { key: 'users', label: t('admin.users'), icon: Users },
    { key: 'purchases', label: t('admin.purchases'), icon: ShoppingCart },
    { key: 'testimonials', label: t('admin.testimonials'), icon: Star },
    { key: 'content', label: t('admin.content'), icon: FileText },
  ];

  async function deleteTool(id: string) {
    if (!confirm(t('admin.confirmDelete'))) return;
    await supabase.from('ai_tools').delete().eq('id', id);
    setTools((prev) => prev.filter((t) => t.id !== id));
  }

  async function deleteResource(id: string) {
    if (!confirm(t('admin.confirmDelete'))) return;
    await supabase.from('resources').delete().eq('id', id);
    setResources((prev) => prev.filter((r) => r.id !== id));
  }

  async function updateUserPlan(uid: string, plan: 'free' | 'pro') {
    await supabase.from('profiles').update({ plan }).eq('id', uid);
    setUsers((prev) => prev.map((u) => (u.id === uid ? { ...u, plan } : u)));
  }

  async function updateUserRole(uid: string, role: 'user' | 'admin') {
    await supabase.from('profiles').update({ role }).eq('id', uid);
    setUsers((prev) => prev.map((u) => (u.id === uid ? { ...u, role } : u)));
  }

  async function deleteTestimonial(id: string) {
    if (!confirm(t('admin.confirmDelete'))) return;
    await supabase.from('testimonials').delete().eq('id', id);
    setTestimonials((prev) => prev.filter((tm) => tm.id !== id));
  }

  async function changeAdminCode() {
    if (!newCode.trim()) return;
    const { error } = await supabase.rpc('update_admin_code', { new_code: newCode });
    if (error) {
      setCodeChangeMsg('Error: ' + error.message);
    } else {
      setCodeChangeMsg(t('admin.codeChanged'));
      setNewCode('');
    }
    setTimeout(() => setCodeChangeMsg(null), 4000);
  }

  async function saveContentRow(row: SiteContentRow, valueEn: string, valueKm: string) {
    setContentSaving(true);
    const { error } = await supabase
      .from('site_content')
      .update({ value_en: valueEn, value_km: valueKm, updated_at: new Date().toISOString() })
      .eq('id', row.id);
    setContentSaving(false);
    if (error) {
      setContentMsg('Error: ' + error.message);
    } else {
      setContentMsg(t('admin.codeChanged'));
      refreshContent();
    }
    setTimeout(() => setContentMsg(null), 3000);
  }

  return (
    <div className="pt-16 min-h-screen">
      <div className="section py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="grid place-items-center w-11 h-11 rounded-xl bg-gradient-to-br from-accent-500 to-brand-500 text-white">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-accent-600 dark:text-accent-400 mb-0.5">
              <span className="text-sm font-semibold">{t('nav.admin')}</span>
            </div>
            <h1 className="text-3xl font-extrabold">{t('admin.title')}</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-3">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`btn !rounded-lg ${
                tab === tb.key
                  ? 'bg-brand-600 text-white hover:bg-brand-700'
                  : 'btn-ghost'
              }`}
            >
              <tb.icon className="w-4 h-4" />
              {tb.label}
            </button>
          ))}
        </div>

        {dataLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          </div>
        ) : (
          <>
            {/* Overview */}
            {tab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatBox icon={Users} label={t('admin.totalUsers')} value={users.length} color="brand" />
                  <StatBox icon={Wrench} label={t('admin.totalTools')} value={tools.length} color="accent" />
                  <StatBox icon={BookOpen} label={t('admin.totalResources')} value={resources.length} color="amber" />
                  <StatBox icon={DollarSign} label={t('admin.totalRevenue')} value={`$${totalRevenue.toFixed(2)}`} color="rose" />
                </div>
                <div className="card p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-brand-500" />
                    {t('admin.purchases')}
                  </h3>
                  <PurchaseTable purchases={purchases.slice(0, 10)} tools={tools} />
                </div>
                <div className="card p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-accent-500" />
                    {t('admin.changeCode')}
                  </h3>
                  <div className="flex gap-2">
                    <input
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      placeholder={t('admin.newCode')}
                      className="input"
                    />
                    <button onClick={changeAdminCode} className="btn-accent whitespace-nowrap">
                      {t('common.save')}
                    </button>
                  </div>
                  {codeChangeMsg && (
                    <div className="text-sm text-accent-600 dark:text-accent-400 mt-2">{codeChangeMsg}</div>
                  )}
                </div>
              </div>
            )}

            {/* Tools */}
            {tab === 'tools' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">{t('admin.tools')}</h2>
                  <button
                    onClick={() => { setEditingTool(null); setShowToolModal(true); }}
                    className="btn-primary"
                  >
                    <Plus className="w-4 h-4" /> {t('admin.addTool')}
                  </button>
                </div>
                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase text-slate-500">
                        <tr>
                          <th className="p-3">{t('common.name')}</th>
                          <th className="p-3">{t('common.category')}</th>
                          <th className="p-3">{t('common.plan')}</th>
                          <th className="p-3">{t('common.price')}</th>
                          <th className="p-3">{t('common.actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tools.map((tool) => {
                          const Icon = getToolIcon(tool.icon);
                          return (
                            <tr key={tool.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30">
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <div className="grid place-items-center w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <span className="font-medium">{tool.name}</span>
                                </div>
                              </td>
                              <td className="p-3 text-slate-500">{tool.category}</td>
                              <td className="p-3">
                                {tool.is_pro ? <span className="badge-pro">{t('common.pro')}</span> : <span className="badge-free">{t('common.free')}</span>}
                              </td>
                              <td className="p-3 font-semibold">${Number(tool.price).toFixed(2)}</td>
                              <td className="p-3">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => { setEditingTool(tool); setShowToolModal(true); }}
                                    className="btn-ghost !p-2"
                                    aria-label={t('common.edit')}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteTool(tool.id)}
                                    className="btn-ghost !p-2 text-rose-500 hover:text-rose-600"
                                    aria-label={t('common.delete')}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Resources */}
            {tab === 'resources' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">{t('admin.resources')}</h2>
                  <button
                    onClick={() => { setEditingResource(null); setShowResourceModal(true); }}
                    className="btn-primary"
                  >
                    <Plus className="w-4 h-4" /> {t('admin.addResource')}
                  </button>
                </div>
                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase text-slate-500">
                        <tr>
                          <th className="p-3">{t('common.name')}</th>
                          <th className="p-3">{t('common.category')}</th>
                          <th className="p-3">{t('admin.resourceType')}</th>
                          <th className="p-3">{t('common.status')}</th>
                          <th className="p-3">{t('common.actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resources.map((r) => (
                          <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30">
                            <td className="p-3 font-medium">{r.name}</td>
                            <td className="p-3 text-slate-500">{r.category}</td>
                            <td className="p-3 capitalize text-slate-500">{r.type}</td>
                            <td className="p-3">
                              {r.is_premium ? <span className="badge-pro">{t('common.premium')}</span> : <span className="badge-free">{t('common.free')}</span>}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => { setEditingResource(r); setShowResourceModal(true); }}
                                  className="btn-ghost !p-2"
                                  aria-label={t('common.edit')}
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteResource(r.id)}
                                  className="btn-ghost !p-2 text-rose-500 hover:text-rose-600"
                                  aria-label={t('common.delete')}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Users */}
            {tab === 'users' && (
              <div>
                <h2 className="text-xl font-bold mb-4">{t('admin.users')}</h2>
                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase text-slate-500">
                        <tr>
                          <th className="p-3">{t('common.name')}</th>
                          <th className="p-3">{t('admin.userPlan')}</th>
                          <th className="p-3">{t('admin.userRole')}</th>
                          <th className="p-3">{t('common.actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30">
                            <td className="p-3">
                              <div className="font-medium">{u.full_name || '—'}</div>
                              <div className="text-xs text-slate-400">{u.id.slice(0, 8)}...</div>
                            </td>
                            <td className="p-3">
                              {u.plan === 'pro' ? <span className="badge-pro">{t('common.pro')}</span> : <span className="badge-free">{t('common.free')}</span>}
                            </td>
                            <td className="p-3">
                              {u.role === 'admin' ? <span className="badge bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300">{t('nav.admin')}</span> : <span className="text-slate-500">User</span>}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1 flex-wrap">
                                {u.plan === 'free' ? (
                                  <button onClick={() => updateUserPlan(u.id, 'pro')} className="btn-ghost !py-1 !px-2 text-xs">
                                    {t('admin.makePro')}
                                  </button>
                                ) : (
                                  <button onClick={() => updateUserPlan(u.id, 'free')} className="btn-ghost !py-1 !px-2 text-xs">
                                    {t('admin.makeFree')}
                                  </button>
                                )}
                                {u.role === 'user' ? (
                                  <button onClick={() => updateUserRole(u.id, 'admin')} className="btn-ghost !py-1 !px-2 text-xs text-accent-600">
                                    {t('admin.makeAdmin')}
                                  </button>
                                ) : (
                                  <button onClick={() => updateUserRole(u.id, 'user')} className="btn-ghost !py-1 !px-2 text-xs">
                                    {t('admin.makeUser')}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Purchases */}
            {tab === 'purchases' && (
              <div>
                <h2 className="text-xl font-bold mb-4">{t('admin.purchases')}</h2>
                <div className="card overflow-hidden">
                  <PurchaseTable purchases={purchases} tools={tools} />
                </div>
              </div>
            )}

            {/* Testimonials */}
            {tab === 'testimonials' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">{t('admin.testimonials')}</h2>
                  <button
                    onClick={() => { setEditingTestimonial(null); setShowTestimonialModal(true); }}
                    className="btn-primary"
                  >
                    <Plus className="w-4 h-4" /> {t('admin.addTestimonial')}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {testimonials.map((tm) => (
                    <div key={tm.id} className="card p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {tm.avatar_url && (
                            <img src={tm.avatar_url} alt={tm.name} className="w-10 h-10 rounded-full object-cover" />
                          )}
                          <div>
                            <div className="font-semibold text-sm">{tm.name}</div>
                            <div className="text-xs text-slate-500">{tm.role}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditingTestimonial(tm); setShowTestimonialModal(true); }}
                            className="btn-ghost !p-2"
                            aria-label={t('common.edit')}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTestimonial(tm.id)}
                            className="btn-ghost !p-2 text-rose-500 hover:text-rose-600"
                            aria-label={t('common.delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < tm.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">"{tm.text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content CMS */}
            {tab === 'content' && (
              <ContentCMSEditor
                content={content}
                contentSection={contentSection}
                setContentSection={setContentSection}
                saving={contentSaving}
                msg={contentMsg}
                onSave={saveContentRow}
              />
            )}
          </>
        )}
      </div>

      {/* Tool edit modal */}
      {showToolModal && (
        <ToolModal
          tool={editingTool}
          onClose={() => setShowToolModal(false)}
          onSave={(saved) => {
            if (editingTool) {
              setTools((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
            } else {
              setTools((prev) => [saved, ...prev]);
            }
            setShowToolModal(false);
          }}
        />
      )}

      {/* Resource edit modal */}
      {showResourceModal && (
        <ResourceModal
          resource={editingResource}
          onClose={() => setShowResourceModal(false)}
          onSave={(saved) => {
            if (editingResource) {
              setResources((prev) => prev.map((r) => (r.id === saved.id ? saved : r)));
            } else {
              setResources((prev) => [saved, ...prev]);
            }
            setShowResourceModal(false);
          }}
        />
      )}

      {/* Testimonial edit modal */}
      {showTestimonialModal && (
        <TestimonialModal
          testimonial={editingTestimonial}
          onClose={() => setShowTestimonialModal(false)}
          onSave={(saved) => {
            if (editingTestimonial) {
              setTestimonials((prev) => prev.map((tm) => (tm.id === saved.id ? saved : tm)));
            } else {
              setTestimonials((prev) => [saved, ...prev]);
            }
            setShowTestimonialModal(false);
          }}
        />
      )}
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    brand: 'from-brand-500/15 to-brand-500/5 text-brand-600 dark:text-brand-400',
    accent: 'from-accent-500/15 to-accent-500/5 text-accent-600 dark:text-accent-400',
    amber: 'from-amber-500/15 to-amber-500/5 text-amber-600 dark:text-amber-400',
    rose: 'from-rose-500/15 to-rose-500/5 text-rose-600 dark:text-rose-400',
  };
  return (
    <div className="card p-5">
      <div className={`grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}

function PurchaseTable({ purchases, tools }: { purchases: Purchase[]; tools: AITool[] }) {
  const { t } = useLang();
  if (purchases.length === 0) {
    return <div className="p-6 text-center text-sm text-slate-500">{t('admin.purchases')}</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="p-3">{t('admin.purchaseItem')}</th>
            <th className="p-3">{t('admin.purchaseAmount')}</th>
            <th className="p-3">{t('admin.purchaseMethod')}</th>
            <th className="p-3">{t('admin.purchaseDate')}</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((p) => {
            const toolName = p.item_type === 'tool' ? tools.find((t) => t.id === p.item_id)?.name : 'Pro Plan';
            return (
              <tr key={p.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="p-3 font-medium">{toolName ?? '—'}</td>
                <td className="p-3 font-semibold">${Number(p.amount).toFixed(2)}</td>
                <td className="p-3 text-slate-500">{p.payment_method} {p.card_last4 ? `****${p.card_last4}` : ''}</td>
                <td className="p-3 text-slate-500">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ToolModal({ tool, onClose, onSave }: { tool: AITool | null; onClose: () => void; onSave: (t: AITool) => void }) {
  const { t } = useLang();
  const [form, setForm] = useState({
    name: tool?.name ?? '',
    slug: tool?.slug ?? '',
    description: tool?.description ?? '',
    icon: tool?.icon ?? 'MessageSquare',
    category: tool?.category ?? 'Writing',
    is_pro: tool?.is_pro ?? false,
    usage_limit_free: tool?.usage_limit_free ?? 5,
    price: tool?.price ?? 0,
    rating: tool?.rating ?? 0,
    reviews_count: tool?.reviews_count ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
      description: form.description,
      icon: form.icon,
      category: form.category,
      is_pro: form.is_pro,
      usage_limit_free: Number(form.usage_limit_free),
      price: Number(form.price),
      rating: Number(form.rating),
      reviews_count: Number(form.reviews_count),
    };
    let result;
    if (tool) {
      result = await supabase.from('ai_tools').update(payload).eq('id', tool.id).select().maybeSingle();
    } else {
      result = await supabase.from('ai_tools').insert(payload).select().maybeSingle();
    }
    setSaving(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    onSave(result.data as AITool);
  }

  return (
    <ModalShell title={tool ? t('admin.editTool') : t('admin.addTool')} onClose={onClose}>
      <form onSubmit={handleSave} className="space-y-3">
        <Field label={t('admin.toolName')}>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
        </Field>
        <Field label={t('admin.toolSlug')}>
          <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input" placeholder="auto-generated from name" />
        </Field>
        <Field label={t('common.description')}>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="input resize-none" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('admin.toolIcon')}>
            <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="input">
              {Object.keys(TOOL_ICONS).map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </Field>
          <Field label={t('admin.toolCategory')}>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
              {TOOL_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label={t('admin.toolUsageLimit')}>
            <input type="number" value={form.usage_limit_free} onChange={(e) => setForm({ ...form, usage_limit_free: Number(e.target.value) })} className="input" />
          </Field>
          <Field label={t('admin.toolPrice')}>
            <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="input" />
          </Field>
          <Field label={t('admin.toolRating')}>
            <input type="number" step="0.1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="input" />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_pro} onChange={(e) => setForm({ ...form, is_pro: e.target.checked })} className="rounded" />
          {t('admin.toolIsPro')}
        </label>
        {error && <div className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-lg p-2">{error}</div>}
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-outline flex-1">{t('common.cancel')}</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.save')}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function ResourceModal({ resource, onClose, onSave }: { resource: Resource | null; onClose: () => void; onSave: (r: Resource) => void }) {
  const { t } = useLang();
  const [form, setForm] = useState({
    name: resource?.name ?? '',
    description: resource?.description ?? '',
    type: resource?.type ?? 'course',
    category: resource?.category ?? '',
    image_url: resource?.image_url ?? '',
    content_url: resource?.content_url ?? '',
    is_premium: resource?.is_premium ?? false,
    rating: resource?.rating ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      name: form.name,
      description: form.description,
      type: form.type,
      category: form.category,
      image_url: form.image_url,
      content_url: form.content_url || null,
      is_premium: form.is_premium,
      rating: Number(form.rating),
    };
    let result;
    if (resource) {
      result = await supabase.from('resources').update(payload).eq('id', resource.id).select().maybeSingle();
    } else {
      result = await supabase.from('resources').insert(payload).select().maybeSingle();
    }
    setSaving(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    onSave(result.data as Resource);
  }

  return (
    <ModalShell title={resource ? t('admin.editResource') : t('admin.addResource')} onClose={onClose}>
      <form onSubmit={handleSave} className="space-y-3">
        <Field label={t('admin.resourceName')}>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
        </Field>
        <Field label={t('common.description')}>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="input resize-none" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('admin.resourceType')}>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
              {RESOURCE_TYPES.map((tp) => (
                <option key={tp} value={tp}>{tp}</option>
              ))}
            </select>
          </Field>
          <Field label={t('admin.resourceCategory')}>
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input" />
          </Field>
        </div>
        <Field label={t('admin.resourceImage')}>
          <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="input" placeholder="https://..." />
        </Field>
        <Field label="Content URL">
          <input value={form.content_url} onChange={(e) => setForm({ ...form, content_url: e.target.value })} className="input" placeholder="https://... (link to course, PDF, video, etc.)" />
        </Field>
        <Field label={t('admin.toolRating')}>
          <input type="number" step="0.1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="input" />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_premium} onChange={(e) => setForm({ ...form, is_premium: e.target.checked })} className="rounded" />
          {t('admin.resourceIsPremium')}
        </label>
        {error && <div className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-lg p-2">{error}</div>}
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-outline flex-1">{t('common.cancel')}</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.save')}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

const CONTENT_SECTIONS = [
  { key: 'hero', label: 'Hero Section' },
  { key: 'stats', label: 'Stats Section' },
  { key: 'features', label: 'Features Section' },
  { key: 'faq', label: 'FAQ Section' },
  { key: 'contact', label: 'Contact Section' },
  { key: 'pricing', label: 'Pricing Section' },
];

function ContentCMSEditor({ content, contentSection, setContentSection, saving, msg, onSave }: {
  content: Record<string, SiteContentRow>;
  contentSection: string;
  setContentSection: (s: string) => void;
  saving: boolean;
  msg: string | null;
  onSave: (row: SiteContentRow, valueEn: string, valueKm: string) => void;
}) {
  const sectionRows = Object.values(content).filter((r) => r.section === contentSection);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Content Management</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Edit page content here. Changes appear instantly on the frontend.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {CONTENT_SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setContentSection(s.key)}
            className={`badge transition ${contentSection === s.key ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-100 dark:hover:bg-brand-900/40'}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {msg && (
        <div className="text-sm text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-950/40 rounded-lg p-3 mb-4">
          {msg}
        </div>
      )}

      <div className="space-y-4">
        {sectionRows.length === 0 && (
          <div className="card p-6 text-center text-sm text-slate-500">No content for this section.</div>
        )}
        {sectionRows.map((row) => (
          <ContentRowEditor key={row.id} row={row} saving={saving} onSave={onSave} />
        ))}
      </div>
    </div>
  );
}

function ContentRowEditor({ row, saving, onSave }: { row: SiteContentRow; saving: boolean; onSave: (row: SiteContentRow, en: string, km: string) => void }) {
  const [en, setEn] = useState(row.value_en ?? '');
  const [km, setKm] = useState(row.value_km ?? '');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setEn(row.value_en ?? '');
    setKm(row.value_km ?? '');
    setDirty(false);
  }, [row.id, row.value_en, row.value_km]);

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <code className="text-xs font-mono text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2 py-1 rounded">
          {row.section}.{row.key}
        </code>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">English</label>
          {row.key.startsWith('a') || row.value_en && row.value_en.length > 60 ? (
            <textarea
              value={en}
              onChange={(e) => { setEn(e.target.value); setDirty(true); }}
              rows={2}
              className="input resize-none text-sm"
            />
          ) : (
            <input
              value={en}
              onChange={(e) => { setEn(e.target.value); setDirty(true); }}
              className="input text-sm"
            />
          )}
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">ខ្មែរ (Khmer)</label>
          {row.key.startsWith('a') || row.value_km && row.value_km.length > 60 ? (
            <textarea
              value={km}
              onChange={(e) => { setKm(e.target.value); setDirty(true); }}
              rows={2}
              className="input resize-none text-sm"
            />
          ) : (
            <input
              value={km}
              onChange={(e) => { setKm(e.target.value); setDirty(true); }}
              className="input text-sm"
            />
          )}
        </div>
      </div>
      <div className="flex justify-end mt-2">
        <button
          onClick={() => onSave(row, en, km)}
          disabled={!dirty || saving}
          className="btn-primary text-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </button>
      </div>
    </div>
  );
}

function TestimonialModal({ testimonial, onClose, onSave }: { testimonial: Testimonial | null; onClose: () => void; onSave: (tm: Testimonial) => void }) {
  const { t } = useLang();
  const [form, setForm] = useState({
    name: testimonial?.name ?? '',
    role: testimonial?.role ?? '',
    avatar_url: testimonial?.avatar_url ?? '',
    text: testimonial?.text ?? '',
    rating: testimonial?.rating ?? 5,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      name: form.name,
      role: form.role,
      avatar_url: form.avatar_url,
      text: form.text,
      rating: Number(form.rating),
    };
    let result;
    if (testimonial) {
      result = await supabase.from('testimonials').update(payload).eq('id', testimonial.id).select().maybeSingle();
    } else {
      result = await supabase.from('testimonials').insert(payload).select().maybeSingle();
    }
    setSaving(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    onSave(result.data as Testimonial);
  }

  return (
    <ModalShell title={testimonial ? t('admin.editTestimonial') : t('admin.addTestimonial')} onClose={onClose}>
      <form onSubmit={handleSave} className="space-y-3">
        <Field label={t('admin.testimonialName')}>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
        </Field>
        <Field label={t('admin.testimonialRole')}>
          <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input" placeholder="Computer Science Student" />
        </Field>
        <Field label={t('admin.testimonialAvatar')}>
          <input value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} className="input" placeholder="https://..." />
        </Field>
        <Field label={t('admin.testimonialText')}>
          <textarea required value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} rows={3} className="input resize-none" />
        </Field>
        <Field label={t('admin.testimonialRating')}>
          <input type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="input" />
        </Field>
        {error && <div className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-lg p-2">{error}</div>}
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-outline flex-1">{t('common.cancel')}</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.save')}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-strong rounded-2xl shadow-glass w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="btn-ghost !p-1.5" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1.5">{label}</label>
      {children}
    </div>
  );
}
