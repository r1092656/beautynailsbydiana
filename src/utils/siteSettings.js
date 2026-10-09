import { supabase } from '../supabaseClient';

const LOCAL_DISABLED_SERVICES_KEY = 'disabled_site_services';
const LOCAL_NEWS_KEY = 'site_announcement';

// --- SERVICE AVAILABILITY ---

export const getDisabledServices = async () => {
  const disabledMap = {};

  try {
    // Primary: fetch from Supabase availability_blocks table using SETTINGS_DISABLED
    const { data, error } = await supabase
      .from('availability_blocks')
      .select('time_slot')
      .eq('date', 'SETTINGS_DISABLED');

    if (!error && data) {
      data.forEach(row => {
        if (row.time_slot) {
          disabledMap[row.time_slot] = true;
        }
      });
      // Also cache locally
      localStorage.setItem(LOCAL_DISABLED_SERVICES_KEY, JSON.stringify(disabledMap));
      return disabledMap;
    }
  } catch (err) {
    console.error('Error fetching disabled services from Supabase:', err);
  }

  // Fallback to localStorage if offline
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

  // Sync to Supabase availability_blocks table
  try {
    if (isDisabled) {
      // First delete any existing setting row for this service
      await supabase
        .from('availability_blocks')
        .delete()
        .eq('date', 'SETTINGS_DISABLED')
        .eq('time_slot', serviceName);

      // Insert new setting row
      await supabase
        .from('availability_blocks')
        .insert([{
          date: 'SETTINGS_DISABLED',
          time_slot: serviceName,
          status: 'disabled'
        }]);
    } else {
      await supabase
        .from('availability_blocks')
        .delete()
        .eq('date', 'SETTINGS_DISABLED')
        .eq('time_slot', serviceName);
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
      .from('availability_blocks')
      .select('time_slot, description')
      .eq('date', 'SETTINGS_NEWS')
      .limit(1);

    if (!error && data && data.length > 0 && data[0].description) {
      const activeNews = JSON.parse(data[0].description);
      localStorage.setItem(LOCAL_NEWS_KEY, JSON.stringify(activeNews));
      return activeNews;
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

  // Sync to Supabase availability_blocks table
  try {
    await supabase
      .from('availability_blocks')
      .delete()
      .eq('date', 'SETTINGS_NEWS');

    await supabase
      .from('availability_blocks')
      .insert([{
        date: 'SETTINGS_NEWS',
        time_slot: announcementObj.id,
        description: JSON.stringify(announcementObj),
        status: 'active'
      }]);
  } catch (err) {
    console.warn('Supabase announcement insert warning:', err);
  }

  return announcementObj;
};

export const deleteAnnouncement = async () => {
  localStorage.removeItem(LOCAL_NEWS_KEY);
  try {
    await supabase
      .from('availability_blocks')
      .delete()
      .eq('date', 'SETTINGS_NEWS');
  } catch (err) {
    console.warn('Supabase announcement delete warning:', err);
  }
};
