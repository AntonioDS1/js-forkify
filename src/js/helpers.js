import { TIMEOUT_SECONDS } from './config';

const timeout = s => {
  // Crea un timeout per far fallire le richieste dopo un determinato lasso di tempo (s).
  return new Promise((_, reject) => {
    // Usa una Promise che fallirà sempre, e verrà usata tramite race.
    setTimeout(() => {
      reject(
        new Error(
          `Request took too long, try again! Timeout after ${s} seconds`,
        ),
      );
    }, s * 1000);
  });
};

export const AJAX = async (url, upload = undefined) => {
  try {
    const fetchPro = upload
      ? fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(upload),
        })
      : fetch(url);

    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SECONDS)]);
    const data = await res.json();
    if (!res.ok)
      // Se ok della risposta è false, la richiesta non è andata a buon fine, e bisogna mettere una guardia che lancia un errore.
      throw new Error(
        `Qualcosa è andato storto, ragione: ${data.message}, stato: ${data.status}`,
      );
    return data;
  } catch (err) {
    throw err;
  }
};
