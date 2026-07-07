import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const ContentContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components -- hook is intentionally colocated with its provider
export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

export const ContentProvider = ({ children }) => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch from Supabase on load
  const fetchContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map Supabase fields to our previous structure
      const formattedData = data.map(item => ({
        id: item.id,
        createdAt: new Date(item.created_at).getTime(),
        image: item.image_url,
        caption: item.caption,
        category: item.category
      }));
      
      setContent(formattedData);
    } catch (e) {
      console.error('Error fetching Supabase content:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: initial data fetch on mount
    fetchContent();
  }, []);

  const addContent = async () => {
    // This will now be handled inside AddContent.jsx with image upload
    // but we can refresh the list here
    await fetchContent();
  };

  const deleteContent = async (id) => {
    try {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setContent((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      console.error('Error deleting from Supabase:', e);
      alert('Er is een fout opgetreden bij het verwijderen.');
    }
  };

  const getWhatsNew = () => {
    const fortyEightHoursAgo = Date.now() - (48 * 60 * 60 * 1000);
    return content.filter(item => item.createdAt > fortyEightHoursAgo);
  };

  const getPortfolioItems = () => {
    const fortyEightHoursAgo = Date.now() - (48 * 60 * 60 * 1000);
    return content.filter(item => item.createdAt <= fortyEightHoursAgo);
  };

  const value = {
    content,
    addContent,
    deleteContent,
    getWhatsNew,
    getPortfolioItems,
    fetchContent,
    loading
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};
