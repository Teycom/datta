import { useEffect } from 'react';
import { APP_FAVICON_DARK, APP_FAVICON_LIGHT, APP_TITLE } from '../constants';

export const Head = () => {
  useEffect(() => {
    document.title = APP_TITLE;
  }, []);

  return (
    <>
      <link
        href={APP_FAVICON_LIGHT}
        rel="icon"
        media="(prefers-color-scheme: light)"
      />
      <link
        href={APP_FAVICON_DARK}
        rel="icon"
        media="(prefers-color-scheme: dark)"
      />
    </>
  );
};