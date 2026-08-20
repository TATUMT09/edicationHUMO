const LEVEL_OPTIONS = [
  { value: 'beginner', label: "Boshlang'ich" },
  { value: 'intermediate', label: "O'rta" },
  { value: 'advanced', label: 'Yuqori' },
];

const TEST_TYPE_OPTIONS = [
  { value: 'closed', label: 'Yopiq test' },
  { value: 'open', label: 'Ochiq test' },
  { value: 'quiz', label: 'Kviz' },
];

export const fields = {
  title: {
    type: 'string',
    required: true,
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
  testType: {
    type: 'select',
    label: 'test_type',
    required: true,
    options: TEST_TYPE_OPTIONS,
  },
  description: {
    type: 'textarea',
    label: 'description',
  },
  timeLimitMinutes: {
    type: 'number',
    label: 'time_limit_minutes',
  },
  passingScorePercent: {
    type: 'number',
    label: 'passing_score_percent',
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
