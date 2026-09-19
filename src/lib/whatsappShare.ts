export const openWhatsAppWebWithText = (text: string): void => {
  window.open(
    'https://web.whatsapp.com/send?text=' + encodeURIComponent(text),
    '_blank',
    'noopener,noreferrer'
  );
};

export const buildStatementShareMessage = (title: string, url: string): string =>
  `AFRAH — ${title}\n${url}`;
