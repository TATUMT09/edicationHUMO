import * as pdfjsLib from 'pdfjs-dist';

// Served as .js (not the package's native .mjs) because nginx on this host
// has no MIME mapping for .mjs and serves it as application/octet-stream —
// browsers refuse to execute a worker with a non-JS Content-Type. The file
// content is still a valid ES module; pdf.js requests it as type:"module"
// internally regardless of the URL's extension.
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const COVER_WIDTH = 400;

// Renders the first page of a PDF (given as raw bytes) to a JPEG Blob,
// entirely in the browser — no server-side PDF rendering (which would need
// Poppler/Ghostscript/node-canvas installed on the shared VPS) is involved.
async function renderFirstPageToBlob(arrayBuffer) {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);

  const baseViewport = page.getViewport({ scale: 1 });
  const scale = COVER_WIDTH / baseViewport.width;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const context = canvas.getContext('2d');

  await page.render({ canvasContext: context, viewport }).promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('canvas.toBlob failed'))),
      'image/jpeg',
      0.85
    );
  });
}

export async function renderPdfFirstPageToBlob(file) {
  return renderFirstPageToBlob(await file.arrayBuffer());
}

// For backfilling covers on PDFs that were already uploaded before this
// feature existed — fetches the file from its public URL instead of a
// freshly-selected File object.
export async function renderPdfFirstPageFromUrl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.status}`);
  return renderFirstPageToBlob(await response.arrayBuffer());
}
