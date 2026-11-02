/**
 * Base path of the admin backoffice. Kept out of public pages, the sitemap and
 * robots.txt — import it only from backoffice code, server code and next.config.
 */
export const BACKOFFICE_PATH = "/backoffice-c37eb6";

export const backofficeHref = (path = "") => `${BACKOFFICE_PATH}${path}`;
