export const fields = {
  title: {
    type: 'string',
    required: true,
  },
  starCost: {
    type: 'number',
    label: 'star_cost',
    required: true,
  },
  stock: {
    type: 'number',
    label: 'stock',
  },
  imageUrl: {
    type: 'string',
    label: 'image_url',
  },
  description: {
    type: 'textarea',
    label: 'description',
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
