const LEVEL_OPTIONS = [
  { value: 'beginner', label: "Boshlang'ich" },
  { value: 'intermediate', label: "O'rta" },
  { value: 'advanced', label: 'Yuqori' },
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
  subject: {
    type: 'async',
    entity: 'subject',
    dataIndex: ['subject', 'name'],
    displayLabels: ['name'],
    outputValue: '_id',
    label: 'subject',
    required: true,
  },
  level: {
    type: 'select',
    label: 'level',
    required: true,
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
