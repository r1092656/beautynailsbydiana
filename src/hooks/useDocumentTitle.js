import { useEffect } from 'react';

const useDocumentTitle = (title) => {
  useEffect(() => {
    document.title = title ? `BN | ${title}` : 'BN | Diana';
  }, [title]);
};

export default useDocumentTitle;
