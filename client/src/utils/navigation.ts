/** Full-page navigation to an external URL (outside React Router). */
export function navigateToExternalUrl(url: string): void {
  window.location.assign(url);
}
