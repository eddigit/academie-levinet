import React, { createContext, useState, useEffect, useContext } from 'react';

const SiteContentContext = createContext();

export const SiteContentProvider = ({ children }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetched, setFetched] = useState(false);

  const fetchSiteContent = async () => {
    if (fetched) return;
    setLoading(true);
    try {
      const response = await fetch('/api/site-content');
      if (!response.ok) {
        throw new Error('Failed to fetch site content');
      }
      const data = await response.json();
      setContent(data);
      setFetched(true);
    } catch (err) {
      console.error('Error loading site content:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiteContent();
  }, []);

  return (
    <SiteContentContext.Provider value={{ content, loading, error, setContent, fetchSiteContent }}>
      {children}
    </SiteContentContext.Provider>
  );
};

export const useSiteContent = () => {
  const context = useContext(SiteContentContext);
  if (context === undefined) {
    throw new Error('useSiteContent must be used within a SiteContentProvider');
  }
  return context;
};

export default SiteContentContext;
