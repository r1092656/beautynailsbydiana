import { supabase } from '../supabaseClient';

const LOCAL_DISABLED_SERVICES_KEY = 'disabled_site_services';
const LOCAL_NEWS_KEY = 'site_announcement';

// We use valid ISO date strings in year 2099 so Postgres DATE type accepts them without syntax errors,
// and they will never collide with calendar dates.
const SETTINGS_DISABLED_DATE = '2099-12-31';
const SETTINGS_NEWS_DATE = '2099-12-30';

// --- SERVICE AVAILABILITY ---

export const getDisabledServices = async () => {
  const disabledMap = {};

  try {
    const { data, error } = await supabase
      .from('availability_blocks')
      .select('time_slot')
      .eq('date', SETTINGS_DISABLED_DATE);

    if (error) {
      console.error('Supabase fetch disabled services error:', error);
    } else if (data) {
      data.forEach(row => {
        if (row.time_slot) {
          disabledMap[row.time_slot] = true;
        }
      });
      localStorage.setItem(LOCAL_DISABLED_SERVICES_KEY, JSON.stringify(disabledMap));
      return disabledMap;
    }
  } catch (err) {
    console.error('Error fetching disabled services from Supabase:', err);
  }

  // Fallback to localStorage if offline or error
  try {
    const raw = localStorage.getItem(LOCAL_DISABLED_SERVICES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const setServiceDisabledState = async (serviceName, isDisabled) => {
  // Update localStorage first for instant feedback
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

  // Sync to Supabase availability_blocks table using valid date '2099-12-31'
  try {
    if (isDisabled) {
      // First delete any previous entry for this service to avoid duplicates
      await supabase
        .from('availability_blocks')
        .delete()
        .eq('date', SETTINGS_DISABLED_DATE)
        .eq('time_slot', serviceName);

      // Insert new disabled setting row
      const { error } = await supabase
        .from('availability_blocks')
        .insert([{
          date: SETTINGS_DISABLED_DATE,
          time_slot: serviceName,
          status: 'disabled'
        }]);

      if (error) {
        console.error('Supabase insert disabled service error:', error);
      }
    } else {
      const { error } = await supabase
        .from('availability_blocks')
        .delete()
        .eq('date', SETTINGS_DISABLED_DATE)
        .eq('time_slot', serviceName);

      if (error) {
        console.error('Supabase delete disabled service error:', error);
      }
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
      .eq('date', SETTINGS_NEWS_DATE)
      .limit(1);

    if (error) {
      console.error('Supabase fetch announcement error:', error);
    } else if (data && data.length > 0 && data[0].description) {
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

  localStorage.setItem(LOCAL_NEWS_KEY, JSON.stringify(announcementObj));

  try {
    await supabase
      .from('availability_blocks')
      .delete()
      .eq('date', SETTINGS_NEWS_DATE);

    const { error } = await supabase
      .from('availability_blocks')
      .insert([{
        date: SETTINGS_NEWS_DATE,
        time_slot: announcementObj.id,
        description: JSON.stringify(announcementObj),
        status: 'active'
      }]);

    if (error) {
      console.error('Supabase insert announcement error:', error);
    }
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
      .eq('date', SETTINGS_NEWS_DATE);
  } catch (err) {
    console.warn('Supabase announcement delete warning:', err);
  }
};
