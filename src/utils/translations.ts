import type { Language } from '@/types';

type TranslationKeys = {
  title: string;
  tab_sleep: string;
  tab_activities: string;
  tab_cycles: string;
  tab_stats: string;
  tab_settings: string;
  cycles_title: string;
  bedtime: string;
  wakeup: string;
  consumption_title: string;
  timeline_title: string;
  mood_title: string;
  daily_note: string;
  daily_note_placeholder: string;
  add_btn: string;
  activity_placeholder: string;
  pleasure: string;
  mastery: string;
  satisfaction: string;
  cycles_header: string;
  new_btn: string;
  no_cycles: string;
  situation_label: string;
  situation_ph: string;
  emotions_label: string;
  emotions_ph: string;
  intensity: string;
  add_emotion: string;
  thoughts_label: string;
  add_thought: string;
  behaviors_label: string;
  add_behavior: string;
  consequences_label: string;
  add_consequence: string;
  stats_sleep_mood: string;
  stats_thoughts: string;
  stats_thoughts_ph: string;
  stats_top_act: string;
  no_data: string;
  print_config: string;
  print_sections: string;
  print_sleep: string;
  print_act: string;
  print_cycles: string;
  select_all: string;
  print_btn: string;
  print_title_sleep: string;
  print_title_act: string;
  save_toast: string;
  error_server: string;
  loading: string;
  placeholder_txt: string;
  settings_title: string;
  lang_title: string;
  config_consumables: string;
  data_management: string;
  export_data: string;
  import_data: string;
  clear_data: string;
  clear_confirm: string;
  label_txt: string;
  icon_txt: string;
  visible_txt: string;
  legend_c: string;
  legend_a: string;
  legend_m: string;
  legend_e: string;
  status_saving: string;
  status_saved: string;
  status_error: string;
  // User Management
  user_management: string;
  users_list: string;
  create_user: string;
  create_user_btn: string;
  edit_user: string;
  delete_user: string;
  username: string;
  password: string;
  email: string;
  admin_privileges: string;
  active_status: string;
  inactive_status: string;
  user_id: string;
  created_date: string;
  no_email: string;
  loading_users: string;
  edit_action: string;
  reset_password: string;
  delete_action: string;
  save_btn: string;
  cancel_btn: string;
  username_required: string;
  password_required: string;
  password_min_length: string;
  user_created: string;
  user_updated: string;
  user_deleted: string;
  password_reset: string;
  delete_confirm: string;
  password_prompt: string;
  password_min_8: string;
  admin_badge: string;
  you_badge: string;
  required_field: string;
  // Appearance & Themes
  appearance: string;
  theme_mode: string;
  theme_dark: string;
  theme_light: string;
  color_scheme: string;
  color_violet: string;
  color_blue: string;
  color_green: string;
  color_rose: string;
  color_orange: string;
  // Dashboard
  tab_dashboard: string;
  welcome: string;
  dashboard_subtitle: string;
  streak: string;
  days_streak: string;
  today_progress: string;
  mood_trend: string;
  sleep_average: string;
  hours: string;
  top_activity: string;
  achievements: string;
  unknown_activity: string;
  // Notifications
  notification_title: string;
  enable_notifications: string;
  notification_time: string;
  notification_message: string;
  notifications_enabled: string;
  notifications_disabled: string;
  notifications_denied: string;
  notifications_not_supported: string;
  daily_reminder: string;
  time_to_journal: string;
  // Stats
  compare_periods: string;
  last_week: string;
  last_month: string;
  trend_up: string;
  trend_down: string;
  trend_stable: string;
};

const translations: Record<Language, TranslationKeys> = {
  fr: {
    title: 'Mon Journal TCC',
    tab_sleep: 'Sommeil',
    tab_activities: 'Activités',
    tab_cycles: 'Cercles',
    tab_stats: 'Analyse',
    tab_settings: 'Paramètres',
    cycles_title: 'CYCLES DE SOMMEIL',
    bedtime: 'Coucher',
    wakeup: 'Lever',
    consumption_title: 'CONSOMMATION',
    timeline_title: 'CHRONOLOGIE 24H',
    mood_title: 'Humeur du jour',
    daily_note: 'Note de la journée',
    daily_note_placeholder: "Comment s'est passée votre journée ?",
    add_btn: '+ Ajouter',
    activity_placeholder: "Nom de l'activité...",
    pleasure: 'Plaisir',
    mastery: 'Maîtrise',
    satisfaction: 'Satisf.',
    cycles_header: 'CERCLES VICIEUX',
    new_btn: '+ Nouveau',
    no_cycles: 'Aucun cercle enregistré.',
    situation_label: 'SITUATION (DÉCLENCHEUR)',
    situation_ph: 'Où ? Quand ? Avec qui ?',
    emotions_label: 'ÉMOTIONS',
    emotions_ph: "Nom de l'émotion...",
    intensity: 'Intensité',
    add_emotion: 'Ajouter une émotion...',
    thoughts_label: 'PENSÉES AUTOMATIQUES',
    add_thought: 'Ajouter une pensée...',
    behaviors_label: 'COMPORTEMENTS',
    add_behavior: 'Ajouter un comportement...',
    consequences_label: 'CONSÉQUENCES',
    add_consequence: 'Ajouter une conséquence...',
    stats_sleep_mood: 'SOMMEIL & HUMEUR (7J)',
    stats_thoughts: 'JOURNAL DES PENSÉES',
    stats_thoughts_ph: 'Note libre...',
    stats_top_act: 'TOP ACTIVITÉS (PLAISIR)',
    no_data: 'Pas assez de données',
    print_config: 'Configuration Impression',
    print_sections: 'SECTIONS À INCLURE',
    print_sleep: 'Sommeil',
    print_act: 'Activités',
    print_cycles: 'Cercles',
    select_all: 'Tout sélectionner',
    print_btn: 'Imprimer',
    print_title_sleep: 'AGENDA DU SOMMEIL',
    print_title_act: 'ACTIVITÉS',
    save_toast: 'Sauvegardé',
    error_server: 'Erreur serveur',
    loading: 'Chargement...',
    placeholder_txt: '...',
    settings_title: 'PARAMÈTRES',
    lang_title: 'Langue',
    config_consumables: 'Configuration Consommables',
    data_management: 'Gestion des Données',
    export_data: 'Exporter (Backup)',
    import_data: 'Importer',
    clear_data: 'Réinitialiser',
    clear_confirm: 'Voulez-vous vraiment TOUT effacer ?',
    label_txt: 'Nom',
    icon_txt: 'Icône',
    visible_txt: 'Visible',
    legend_c: 'C = Café',
    legend_a: 'A = Addiction 1',
    legend_m: 'M = Médicament',
    legend_e: 'E = Exercice',
    status_saving: 'Sauvegarde...',
    status_saved: 'Enregistré',
    status_error: 'Erreur',
    // User Management
    user_management: 'Gestion des Utilisateurs',
    users_list: 'Liste des Utilisateurs',
    create_user: 'Créer un Utilisateur',
    create_user_btn: 'Créer un Nouvel Utilisateur',
    edit_user: "Modifier l'Utilisateur",
    delete_user: "Supprimer l'Utilisateur",
    username: "Nom d'utilisateur",
    password: 'Mot de passe',
    email: 'Email',
    admin_privileges: 'Privilèges Administrateur',
    active_status: 'Actif',
    inactive_status: 'Inactif',
    user_id: 'ID',
    created_date: 'Date de création',
    no_email: "Pas d'email",
    loading_users: 'Chargement des utilisateurs...',
    edit_action: "Modifier l'utilisateur",
    reset_password: 'Réinitialiser le mot de passe',
    delete_action: "Supprimer l'utilisateur",
    save_btn: 'Enregistrer',
    cancel_btn: 'Annuler',
    username_required: "Le nom d'utilisateur est requis",
    password_required: 'Le mot de passe est requis',
    password_min_length: 'Le mot de passe doit contenir au moins 8 caractères',
    user_created: 'Utilisateur créé avec succès',
    user_updated: 'Utilisateur modifié avec succès',
    user_deleted: 'Utilisateur supprimé avec succès',
    password_reset: 'Mot de passe réinitialisé avec succès',
    delete_confirm:
      'Supprimer l\'utilisateur "{username}" ? Cela supprimera définitivement toutes ses données.',
    password_prompt: 'Entrez le nouveau mot de passe pour "{username}" :',
    password_min_8: 'min 8 caractères',
    admin_badge: 'Admin',
    you_badge: 'Vous',
    required_field: 'requis',
    // Appearance & Themes
    appearance: 'Apparence',
    theme_mode: "Mode d'affichage",
    theme_dark: 'Sombre',
    theme_light: 'Clair',
    color_scheme: 'Thème de couleur',
    color_violet: 'Violet',
    color_blue: 'Bleu',
    color_green: 'Vert',
    color_rose: 'Rose',
    color_orange: 'Orange',
    // Dashboard
    tab_dashboard: 'Tableau de bord',
    welcome: 'Bienvenue',
    dashboard_subtitle: "Votre progression en un coup d'œil",
    streak: 'Série',
    days_streak: '{count} jours consécutifs',
    today_progress: 'Progression du jour',
    mood_trend: "Tendance d'humeur",
    sleep_average: 'Sommeil moyen',
    hours: 'heures',
    top_activity: 'Meilleure activité',
    achievements: 'Accomplissements',
    unknown_activity: 'Activité inconnue',
    // Notifications
    notification_title: 'Rappels',
    enable_notifications: 'Activer les notifications',
    notification_time: 'Heure du rappel',
    notification_message: "N'oubliez pas de remplir votre journal !",
    notifications_enabled: 'Notifications activées',
    notifications_disabled: 'Notifications désactivées',
    notifications_denied: 'Permission refusée',
    notifications_not_supported: 'Notifications non supportées',
    daily_reminder: 'Rappel quotidien',
    time_to_journal: "C'est l'heure de remplir votre journal !",
    // Stats
    compare_periods: 'Comparer les périodes',
    last_week: 'Semaine dernière',
    last_month: 'Mois dernier',
    trend_up: 'En amélioration',
    trend_down: 'En baisse',
    trend_stable: 'Stable',
  },
  en: {
    title: 'My CBT Journal',
    tab_sleep: 'Sleep',
    tab_activities: 'Activities',
    tab_cycles: 'Cycles',
    tab_stats: 'Analysis',
    tab_settings: 'Settings',
    cycles_title: 'SLEEP CYCLES',
    bedtime: 'Bedtime',
    wakeup: 'Wake up',
    consumption_title: 'CONSUMPTION',
    timeline_title: '24H TIMELINE',
    mood_title: 'Daily Mood',
    daily_note: 'Daily note',
    daily_note_placeholder: 'How was your day?',
    add_btn: '+ Add',
    activity_placeholder: 'Activity name...',
    pleasure: 'Pleasure',
    mastery: 'Mastery',
    satisfaction: 'Satisf.',
    cycles_header: 'VICIOUS CYCLES',
    new_btn: '+ New',
    no_cycles: 'No cycle recorded.',
    situation_label: 'SITUATION (TRIGGER)',
    situation_ph: 'Where? When? Who?',
    emotions_label: 'EMOTIONS',
    emotions_ph: 'Emotion name...',
    intensity: 'Intensity',
    add_emotion: 'Add an emotion...',
    thoughts_label: 'AUTOMATIC THOUGHTS',
    add_thought: 'Add a thought...',
    behaviors_label: 'BEHAVIORS',
    add_behavior: 'Add a behavior...',
    consequences_label: 'CONSEQUENCES',
    add_consequence: 'Add a consequence...',
    stats_sleep_mood: 'SLEEP & MOOD (7D)',
    stats_thoughts: 'THOUGHTS JOURNAL',
    stats_thoughts_ph: 'Free note...',
    stats_top_act: 'TOP ACTIVITIES (PLEASURE)',
    no_data: 'Not enough data',
    print_config: 'Print Configuration',
    print_sections: 'SECTIONS TO INCLUDE',
    print_sleep: 'Sleep',
    print_act: 'Activities',
    print_cycles: 'Cycles',
    select_all: 'Select All',
    print_btn: 'Print',
    print_title_sleep: 'SLEEP DIARY',
    print_title_act: 'ACTIVITIES',
    save_toast: 'Saved',
    error_server: 'Server Error',
    loading: 'Loading...',
    placeholder_txt: '...',
    settings_title: 'SETTINGS',
    lang_title: 'Language',
    config_consumables: 'Consumables Config',
    data_management: 'Data Management',
    export_data: 'Export (Backup)',
    import_data: 'Import',
    clear_data: 'Reset Data',
    clear_confirm: 'Do you really want to clear EVERYTHING?',
    label_txt: 'Name',
    icon_txt: 'Icon',
    visible_txt: 'Visible',
    legend_c: 'C = Coffee',
    legend_a: 'A = Addiction 1',
    legend_m: 'M = Meds',
    legend_e: 'E = Exercise',
    status_saving: 'Saving...',
    status_saved: 'Saved',
    status_error: 'Error',
    // User Management
    user_management: 'User Management',
    users_list: 'Users List',
    create_user: 'Create User',
    create_user_btn: 'Create New User',
    edit_user: 'Edit User',
    delete_user: 'Delete User',
    username: 'Username',
    password: 'Password',
    email: 'Email',
    admin_privileges: 'Admin Privileges',
    active_status: 'Active',
    inactive_status: 'Inactive',
    user_id: 'ID',
    created_date: 'Created',
    no_email: 'No email',
    loading_users: 'Loading users...',
    edit_action: 'Edit user',
    reset_password: 'Reset password',
    delete_action: 'Delete user',
    save_btn: 'Save',
    cancel_btn: 'Cancel',
    username_required: 'Username is required',
    password_required: 'Password is required',
    password_min_length: 'Password must be at least 8 characters',
    user_created: 'User created successfully',
    user_updated: 'User updated successfully',
    user_deleted: 'User deleted successfully',
    password_reset: 'Password reset successfully',
    delete_confirm:
      'Delete user "{username}"? This will permanently delete all their data.',
    password_prompt: 'Enter new password for "{username}":',
    password_min_8: 'min 8 chars',
    admin_badge: 'Admin',
    you_badge: 'You',
    required_field: 'required',
    // Appearance & Themes
    appearance: 'Appearance',
    theme_mode: 'Display Mode',
    theme_dark: 'Dark',
    theme_light: 'Light',
    color_scheme: 'Color Theme',
    color_violet: 'Violet',
    color_blue: 'Blue',
    color_green: 'Green',
    color_rose: 'Rose',
    color_orange: 'Orange',
    // Dashboard
    tab_dashboard: 'Dashboard',
    welcome: 'Welcome',
    dashboard_subtitle: 'Your progress at a glance',
    streak: 'Streak',
    days_streak: '{count} days streak',
    today_progress: "Today's Progress",
    mood_trend: 'Mood Trend',
    sleep_average: 'Average Sleep',
    hours: 'hours',
    top_activity: 'Top Activity',
    achievements: 'Achievements',
    unknown_activity: 'Unknown activity',
    // Notifications
    notification_title: 'Reminders',
    enable_notifications: 'Enable notifications',
    notification_time: 'Reminder time',
    notification_message: "Don't forget to fill in your journal!",
    notifications_enabled: 'Notifications enabled',
    notifications_disabled: 'Notifications disabled',
    notifications_denied: 'Permission denied',
    notifications_not_supported: 'Notifications not supported',
    daily_reminder: 'Daily reminder',
    time_to_journal: 'Time to fill in your journal!',
    // Stats
    compare_periods: 'Compare periods',
    last_week: 'Last week',
    last_month: 'Last month',
    trend_up: 'Improving',
    trend_down: 'Declining',
    trend_stable: 'Stable',
  },
};

export type TranslationKey = keyof TranslationKeys;

export const getTranslation = (lang: Language, key: TranslationKey): string => {
  return translations[lang][key] || key;
};

export default translations;
