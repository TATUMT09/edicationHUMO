export const fields = {
  name: {
    type: 'string',
    required: true,
  },
  slug: {
    type: 'string',
    required: true,
    label: 'slug',
  },
  icon: {
    type: 'string',
    label: 'icon',
  },
  order: {
    type: 'number',
    label: 'order',
  },
  enabled: {
    type: 'boolean',
    label: 'enabled',
  },
};
