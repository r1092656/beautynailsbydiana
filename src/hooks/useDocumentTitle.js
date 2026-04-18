import { useEffect } from 'react';

const useDocumentTitle = (title, description) => {
  useEffect(() => {
    const baseTitle = 'BN | Diana';
    const fullTitle = title ? `${baseTitle} - ${title}` : `${baseTitle} - Professionele Nagelstudio Laakdal`;
    document.title = fullTitle;

    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }
    }
  }, [title, description]);
};

export default useDocumentTitle;
