// Slug is auto-generated from the name (backend/models/appModels/Subject.js)
// so the admin never has to think about it. Icon isn't rendered anywhere in
// the portal yet and order rarely matters (falls back to alphabetical) — so
// neither is worth asking for on a form that should just be "type a name".
export const fields = {
  name: {
    type: 'string',
    required: true,
  },
  enabled: {
    type: 'boolean',
    label: 'enabled',
  },
};
