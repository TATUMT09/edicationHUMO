const LEVEL_OPTIONS = [
  { value: 'beginner', label: "Boshlang'ich" },
  { value: 'intermediate', label: "O'rta" },
  { value: 'advanced', label: 'Yuqori' },
];

const CATEGORY_OPTIONS = [
  { value: 'study', label: "O'quv adabiyoti" },
  { value: 'fiction', label: 'Badiiy adabiyot' },
];

export const fields = {
  title: {
    type: 'string',
    required: true,
  },
  author: {
    type: 'string',
    label: 'author',
  },
  category: {
    type: 'select',
    label: 'category',
    options: CATEGORY_OPTIONS,
  },
  subject: {
    type: 'async',
    entity: 'subject',
    dataIndex: ['subject', 'name'],
    displayLabels: ['name'],
    outputValue: '_id',
    label: 'subject',
  },
  level: {
    type: 'select',
    label: 'level',
    options: LEVEL_OPTIONS,
  },
  fileUrl: {
    type: 'string',
    required: true,
    label: 'file_url',
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
