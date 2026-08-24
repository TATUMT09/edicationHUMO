const mammoth = require('mammoth');

// HTML (not extractRawText) on purpose: teachers commonly mark the correct
// option with bold/underline in the .docx, and plain-text extraction would
// throw that signal away before the model ever sees it.
const extractDocText = async (buffer) => {
  const { value: html } = await mammoth.convertToHtml({ buffer });
  return html;
};

module.exports = extractDocText;
