import { memo, useRef, useState, useEffect, useCallback } from 'react';
import { useAuthStore, useSettingsStore, useUIStore } from '@/stores';
import { getTranslation } from '@/utils/translations';
import { getConsumableColor, getConsumableBg } from '@/utils/helpers';
import { GlowCard, Icons, ICON_MAP } from '@/components/ui';
import { api } from '@/api';
import type { ColorScheme, User } from '@/types';

/**
 * Settings tab component
 */
const SettingsTab = memo(function SettingsTab() {
  const { settings, updateSettings, updateConsumable } = useSettingsStore();
  const { showToast } = useUIStore();
  const { logout, isAdmin } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User management state
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', is_admin: false });
  const [resetPasswordId, setResetPasswordId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.lang, key);

  // Load users for admin
  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const result = await api.admin.listUsers();
      if (result?.users) {
        setUsers(result.users);
      }
    } catch (err) {
      console.error('loadUsers error:', err);
    }
    setLoadingUsers(false);
  }, []);

  // Load users when component mounts and isAdmin is true
  useEffect(() => {
    if (isAdmin) {
      void loadUsers();
    }
  }, [isAdmin, loadUsers]);

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.password) {
      showToast(settings.lang === 'fr' ? 'Nom et mot de passe requis' : 'Username and password required', 'error');
      return;
    }
    if (newUser.password.length < 8) {
      showToast(settings.lang === 'fr' ? 'Le mot de passe doit contenir au moins 8 caractères' : 'Password must be at least 8 characters', 'error');
      return;
    }
    if (newUser.username.length < 3) {
      showToast(settings.lang === 'fr' ? 'Le nom doit contenir au moins 3 caractères' : 'Username must be at least 3 characters', 'error');
      return;
    }
    const result = await api.admin.createUser(newUser.username, newUser.password, newUser.email, newUser.is_admin);
    if (result.ok) {
      showToast(settings.lang === 'fr' ? 'Utilisateur créé' : 'User created', 'success');
      setNewUser({ username: '', email: '', password: '', is_admin: false });
      setShowAddUser(false);
      void loadUsers();
    } else {
      const errorData = result.data as string;
      const errorMsg = errorData?.includes('already exists')
        ? (settings.lang === 'fr' ? 'Ce nom ou email existe déjà' : 'Username or email already exists')
        : (settings.lang === 'fr' ? 'Erreur création' : 'Creation error');
      showToast(errorMsg, 'error');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const result = await api.admin.deleteUser(userId);
    if (result.ok) {
      showToast(settings.lang === 'fr' ? 'Utilisateur supprimé' : 'User deleted', 'success');
      void loadUsers();
    } else {
      showToast(settings.lang === 'fr' ? 'Erreur suppression' : 'Delete error', 'error');
    }
  };

  const handleToggleAdmin = async (user: User) => {
    const result = await api.admin.updateUser(user.id, { is_admin: !user.is_admin });
    if (result.ok) {
      showToast(settings.lang === 'fr' ? 'Rôle mis à jour' : 'Role updated', 'success');
      void loadUsers();
    }
  };

  const handleToggleActive = async (user: User) => {
    const result = await api.admin.updateUser(user.id, { is_active: !user.is_active });
    if (result.ok) {
      showToast(settings.lang === 'fr' ? 'Statut mis à jour' : 'Status updated', 'success');
      void loadUsers();
    }
  };

  const handleResetPassword = async (userId: number) => {
    if (!newPassword) {
      showToast(settings.lang === 'fr' ? 'Mot de passe requis' : 'Password required', 'error');
      return;
    }
    const result = await api.admin.resetPassword(userId, newPassword);
    if (result.ok) {
      showToast(settings.lang === 'fr' ? 'Mot de passe réinitialisé' : 'Password reset', 'success');
      setResetPasswordId(null);
      setNewPassword('');
    } else {
      showToast(settings.lang === 'fr' ? 'Erreur réinitialisation' : 'Reset error', 'error');
    }
  };

  const handleExport = () => {
    window.open('/api/export/json', '_blank');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        JSON.parse(e.target?.result as string);
        showToast('Données importées !', 'success');
      } catch {
        showToast('Erreur fichier invalide', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleLogout = async () => {
    await logout();
  };

  const colorSchemes: { name: ColorScheme; colorClass: string }[] = [
    { name: 'violet', colorClass: 'bg-violet-500' },
    { name: 'blue', colorClass: 'bg-blue-500' },
    { name: 'green', colorClass: 'bg-emerald-500' },
    { name: 'rose', colorClass: 'bg-rose-500' },
    { name: 'orange', colorClass: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-center mb-6 text-[var(--text-main)]">
        {t('settings_title')}
      </h2>

      {/* Language */}
      <GlowCard className="bg-[var(--bg-card)] rounded-2xl p-5 shadow-[var(--shadow-md)] card-animated stagger-delay-1">
        <h3 className="text-xs font-semibold text-[var(--text-secondary)] mb-4 uppercase tracking-wider">
          {t('lang_title')}
        </h3>
        <div className="flex gap-3" role="radiogroup" aria-label={t('lang_title')}>
          <button
            onClick={() => updateSettings({ lang: 'fr' })}
            className={`btn-interactive flex-1 py-3 rounded-xl font-bold transition-all ${
              settings.lang === 'fr'
                ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20'
                : 'bg-input text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
            }`}
            role="radio"
            aria-checked={settings.lang === 'fr'}
          >
            Français
          </button>
          <button
            onClick={() => updateSettings({ lang: 'en' })}
            className={`btn-interactive flex-1 py-3 rounded-xl font-bold transition-all ${
              settings.lang === 'en'
                ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20'
                : 'bg-input text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
            }`}
            role="radio"
            aria-checked={settings.lang === 'en'}
          >
            English
          </button>
        </div>
      </GlowCard>

      {/* Appearance */}
      <GlowCard className="bg-[var(--bg-card)] rounded-2xl p-5 shadow-[var(--shadow-md)] card-animated stagger-delay-2">
        <h3 className="text-xs font-semibold text-[var(--text-secondary)] mb-4 uppercase tracking-wider">
          {t('appearance')}
        </h3>

        {/* Theme mode */}
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-[var(--text-main)] mb-3">
            {t('theme_mode')}
          </h4>
          <div className="flex gap-3" role="radiogroup" aria-label={t('theme_mode')}>
            <button
              onClick={() => updateSettings({ theme: 'dark' })}
              className={`btn-interactive flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                settings.theme === 'dark'
                  ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20'
                  : 'bg-input text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
              }`}
              role="radio"
              aria-checked={settings.theme === 'dark'}
            >
              <Icons.Moon className="w-4 h-4" />
              {t('theme_dark')}
            </button>
            <button
              onClick={() => updateSettings({ theme: 'light' })}
              className={`btn-interactive flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                settings.theme === 'light'
                  ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20'
                  : 'bg-input text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
              }`}
              role="radio"
              aria-checked={settings.theme === 'light'}
            >
              <Icons.Sun className="w-4 h-4" />
              {t('theme_light')}
            </button>
          </div>
        </div>

        {/* Color scheme */}
        <div>
          <h4 className="text-sm font-semibold text-[var(--text-main)] mb-3">
            {t('color_scheme')}
          </h4>
          <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label={t('color_scheme')}>
            {colorSchemes.map((scheme, idx) => (
              <button
                key={scheme.name}
                onClick={() => updateSettings({ colorScheme: scheme.name })}
                className={`relative py-3 px-2 rounded-xl font-bold transition-all hover:scale-105 card-animated stagger-delay-${idx + 1} ${
                  settings.colorScheme === scheme.name
                    ? 'bg-[var(--bg-elevated)] scale-105'
                    : 'bg-[var(--bg-main)]/30'
                }`}
                role="radio"
                aria-checked={settings.colorScheme === scheme.name}
                aria-label={t(`color_${scheme.name}` as keyof typeof t)}
              >
                <div
                  className={`w-8 h-8 rounded-full ${scheme.colorClass} mx-auto mb-1 shadow-lg transition-transform ${
                    settings.colorScheme === scheme.name ? 'scale-110 ring-2 ring-white/30' : ''
                  }`}
                />
                <div className="text-xs text-[var(--text-secondary)]">
                  {t(`color_${scheme.name}` as keyof typeof t)}
                </div>
                {settings.colorScheme === scheme.name && (
                  <div className="absolute top-1 right-1 text-[var(--primary)] animate-pop-in">
                    <Icons.CheckSmall />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </GlowCard>

      {/* Consumables config */}
      <GlowCard className="bg-[var(--bg-card)] rounded-2xl p-5 shadow-[var(--shadow-md)] card-animated stagger-delay-4">
        <h3 className="text-xs font-semibold text-[var(--text-secondary)] mb-4 uppercase tracking-wider">
          {t('config_consumables')}
        </h3>
        <div className="space-y-3">
          {settings.consumables.map((item, idx) => {
            const ItemIcon = ICON_MAP[item.icon] || Icons.Leaf;
            const iconColor = getConsumableColor(item.key);
            const iconBg = getConsumableBg(item.key);
            return (
              <div
                key={item.key}
                className="bg-input p-3 rounded-xl"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: iconBg, color: iconColor }}
                  >
                    <ItemIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => updateConsumable(idx, 'label', e.target.value)}
                    className="bg-transparent font-bold text-[var(--text-main)] border-b border-[var(--border-light)] w-full placeholder:text-[var(--text-muted)]"
                    placeholder={t('label_txt')}
                    aria-label={`Nom pour ${item.key}`}
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={item.icon}
                    onChange={(e) => updateConsumable(idx, 'icon', e.target.value)}
                    className="bg-[var(--bg-elevated)] text-xs text-[var(--text-main)] rounded-lg px-2 py-1.5"
                    aria-label={`Icône pour ${item.label}`}
                  >
                    {Object.keys(ICON_MAP).map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer ml-auto">
                    <input
                      type="checkbox"
                      checked={item.active}
                      onChange={(e) => updateConsumable(idx, 'active', e.target.checked)}
                      className="accent-[var(--primary)] w-4 h-4"
                    />
                    {t('visible_txt')}
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </GlowCard>

      {/* Data management */}
      <GlowCard className="bg-[var(--bg-card)] rounded-2xl p-5 shadow-[var(--shadow-md)] card-animated stagger-delay-5">
        <h3 className="text-xs font-semibold text-[var(--text-secondary)] mb-4 uppercase tracking-wider">
          {t('data_management')}
        </h3>
        <div className="space-y-3">
          <div className="bg-[var(--bg-main)]/30 p-4 rounded-xl">
            <h4 className="text-xs font-semibold text-[var(--text-secondary)] mb-3">EXPORT</h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => window.open('/api/export/json', '_blank')}
                className="btn-interactive flex flex-col items-center gap-1 py-3 bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] rounded-lg text-xs font-bold text-[var(--text-main)] transition-all"
              >
                <Icons.Download className="w-4 h-4" />
                <span>JSON</span>
              </button>
              <button
                onClick={() => window.open('/api/export/csv', '_blank')}
                className="btn-interactive flex flex-col items-center gap-1 py-3 bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] rounded-lg text-xs font-bold text-[var(--text-main)] transition-all"
              >
                <Icons.Download className="w-4 h-4" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => window.open('/api/export/pdf', '_blank')}
                className="btn-interactive flex flex-col items-center gap-1 py-3 bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] rounded-lg text-xs font-bold text-[var(--text-main)] transition-all"
              >
                <Icons.Download className="w-4 h-4" />
                <span>PDF</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleExport}
            className="btn-interactive w-full flex items-center justify-center gap-2 py-3 bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] rounded-xl font-bold text-[var(--text-main)] transition-all"
          >
            <Icons.Download className="w-4 h-4" />
            {t('export_data')} (Local)
          </button>

          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
              aria-label={t('import_data')}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-interactive w-full flex items-center justify-center gap-2 py-3 bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] rounded-xl font-bold text-[var(--text-main)] transition-all"
            >
              <Icons.Upload className="w-4 h-4" />
              {t('import_data')}
            </button>
          </div>
        </div>
      </GlowCard>

      {/* Admin panel - User Management */}
      {isAdmin && (
        <GlowCard className="bg-[var(--bg-card)] rounded-2xl p-5 shadow-[var(--shadow-md)] card-animated stagger-delay-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
              <Icons.Shield className="w-4 h-4" />
              {t('user_management')}
            </h3>
            <button
              onClick={() => setShowAddUser(!showAddUser)}
              className="btn-interactive text-xs px-3 py-1.5 rounded-lg bg-[var(--primary)]/20 text-[var(--primary)] hover:bg-[var(--primary)]/30 font-semibold transition-all flex items-center gap-1"
            >
              <Icons.Plus className="w-3 h-3" />
              {settings.lang === 'fr' ? 'Ajouter' : 'Add'}
            </button>
          </div>

          {/* Add user form */}
          {showAddUser && (
            <div className="bg-[var(--bg-main)]/30 p-4 rounded-xl mb-4 space-y-3">
              <input
                type="text"
                placeholder={settings.lang === 'fr' ? "Nom d'utilisateur" : 'Username'}
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg-elevated)] rounded-lg text-sm text-[var(--text-main)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)]/50 outline-none"
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg-elevated)] rounded-lg text-sm text-[var(--text-main)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)]/50 outline-none"
              />
              <input
                type="password"
                placeholder={settings.lang === 'fr' ? 'Mot de passe' : 'Password'}
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg-elevated)] rounded-lg text-sm text-[var(--text-main)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)]/50 outline-none"
              />
              <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={newUser.is_admin}
                  onChange={(e) => setNewUser({ ...newUser, is_admin: e.target.checked })}
                  className="accent-[var(--primary)] w-4 h-4"
                />
                Admin
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => void handleCreateUser()}
                  className="flex-1 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-bold hover:bg-[var(--primary-dark)] transition-all"
                >
                  {settings.lang === 'fr' ? 'Créer' : 'Create'}
                </button>
                <button
                  onClick={() => setShowAddUser(false)}
                  className="px-4 py-2 bg-[var(--bg-elevated)] text-[var(--text-secondary)] rounded-lg text-sm font-bold hover:bg-[var(--bg-card-hover)] transition-all"
                >
                  {settings.lang === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
              </div>
            </div>
          )}

          {/* Users list */}
          {loadingUsers ? (
            <div className="flex items-center justify-center py-8">
              <Icons.Loading className="w-6 h-6" />
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`bg-[var(--bg-main)]/30 p-3 rounded-xl transition-all ${!user.is_active ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${user.is_admin ? 'bg-[var(--primary)]' : 'bg-[var(--text-muted)]'}`}>
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                          {user.username}
                          {user.is_admin && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--primary)]/20 text-[var(--primary)]">
                              Admin
                            </span>
                          )}
                        </div>
                        {user.email && (
                          <div className="text-xs text-[var(--text-muted)]">{user.email}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Toggle active */}
                      <button
                        onClick={() => void handleToggleActive(user)}
                        className={`p-1.5 rounded-lg transition-all ${user.is_active ? 'text-emerald-400 hover:bg-emerald-400/10' : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]'}`}
                        title={user.is_active ? 'Désactiver' : 'Activer'}
                      >
                        {user.is_active ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        )}
                      </button>
                      {/* Toggle admin */}
                      <button
                        onClick={() => void handleToggleAdmin(user)}
                        className={`p-1.5 rounded-lg transition-all ${user.is_admin ? 'text-[var(--primary)] hover:bg-[var(--primary)]/10' : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]'}`}
                        title={user.is_admin ? 'Retirer admin' : 'Rendre admin'}
                      >
                        <Icons.Shield className="w-4 h-4" />
                      </button>
                      {/* Reset password */}
                      <button
                        onClick={() => setResetPasswordId(resetPasswordId === user.id ? null : user.id)}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-amber-400 transition-all"
                        title="Réinitialiser mot de passe"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => void handleDeleteUser(user.id)}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 transition-all"
                        title="Supprimer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {/* Reset password form */}
                  {resetPasswordId === user.id && (
                    <div className="mt-3 pt-3 border-t border-[var(--border)] flex gap-2">
                      <input
                        type="password"
                        placeholder={settings.lang === 'fr' ? 'Nouveau mot de passe' : 'New password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="flex-1 px-3 py-2 bg-[var(--bg-elevated)] rounded-lg text-sm text-[var(--text-main)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)]/50 outline-none"
                      />
                      <button
                        onClick={() => void handleResetPassword(user.id)}
                        className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg text-sm font-bold hover:bg-amber-500/30 transition-all"
                      >
                        OK
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {users.length === 0 && (
                <div className="text-center py-4 text-[var(--text-muted)] text-sm">
                  {settings.lang === 'fr' ? 'Aucun utilisateur' : 'No users'}
                </div>
              )}
            </div>
          )}
        </GlowCard>
      )}

      {/* Logout */}
      <GlowCard className="bg-[var(--bg-card)] rounded-2xl p-5 shadow-[var(--shadow-md)] card-animated stagger-delay-6">
        <button
          onClick={() => void handleLogout()}
          className="btn-interactive w-full flex items-center justify-center gap-2 py-3 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl font-bold text-rose-400 transition-all"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          {settings.lang === 'fr' ? 'Déconnexion' : 'Logout'}
        </button>
      </GlowCard>
    </div>
  );
});

export default SettingsTab;
