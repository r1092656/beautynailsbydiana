import { supabase } from '../supabaseClient';

const LOCAL_DISABLED_SERVICES_KEY = 'disabled_site_services';
const LOCAL_NEWS_KEY = 'site_announcement';

// --- SERVICE AVAILABILITY ---

export const getDisabledServices = async () => {
  try {
    // 1. Try Supabase
    const { data, error } = await supabase
      .from('disabled_services')
      .select('service_name');

    if (!error && data) {
      const disabledMap = {};
      data.forEach(row => {
        disabledMap[row.service_name] = true;
      });
      return disabledMap;
    }
  } catch (err) {
    console.error('Error fetching disabled services from Supabase:', err);
  }

  // 2. LocalStorage Fallback
  try {
    const raw = localStorage.getItem(LOCAL_DISABLED_SERVICES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const setServiceDisabledState = async (serviceName, isDisabled) => {
  // Update localStorage first for immediate reactivity
  let currentMap = {};
  try {
    const raw = localStorage.getItem(LOCAL_DISABLED_SERVICES_KEY);
    currentMap = raw ? JSON.parse(raw) : {};
  } catch {
    currentMap = {};
  }

  if (isDisabled) {
    currentMap[serviceName] = true;
  } else {
    delete currentMap[serviceName];
  }

  localStorage.setItem(LOCAL_DISABLED_SERVICES_KEY, JSON.stringify(currentMap));

  // Try Supabase sync
  try {
    if (isDisabled) {
      await supabase.from('disabled_services').upsert({ service_name: serviceName, disabled: true }, { onConflict: 'service_name' });
    } else {
      await supabase.from('disabled_services').delete().eq('service_name', serviceName);
    }
  } catch (err) {
    console.warn('Supabase sync for disabled services warning:', err);
  }

  return currentMap;
};

// --- NEWS / ANNOUNCEMENT ---

export const getActiveAnnouncement = async () => {
  try {
    const { data, error } = await supabase
      .from('site_announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (!error && data && data.length > 0) {
      return data[0];
    }
  } catch (err) {
    console.error('Error fetching announcement from Supabase:', err);
  }

  try {
    const stored = localStorage.getItem(LOCAL_NEWS_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const saveAnnouncement = async (title, content, daysValid = 7) => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + daysValid * 24 * 60 * 60 * 1000);

  const announcementObj = {
    id: `news_${Date.now()}`,
    title: title || 'Nieuws & Update',
    content,
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    active: true
  };

  // Save in LocalStorage immediately
  localStorage.setItem(LOCAL_NEWS_KEY, JSON.stringify(announcementObj));

  // Try Supabase
  try {
    await supabase.from('site_announcements').insert([{
      title: announcementObj.title,
      content: announcementObj.content,
      created_at: announcementObj.created_at,
      expires_at: announcementObj.expires_at,
      active: true
    }]);
  } catch (err) {
    console.warn('Supabase announcement insert warning:', err);
  }

  return announcementObj;
};

export const deleteAnnouncement = async (id) => {
  localStorage.removeItem(LOCAL_NEWS_KEY);
  try {
    if (id) {
      await supabase.from('site_announcements').delete().eq('id', id);
    } else {
      await supabase.from('site_announcements').update({ active: false }).neq('id', '0');
    }
  } catch (err) {
    console.warn('Supabase announcement delete warning:', err);
  }
};
