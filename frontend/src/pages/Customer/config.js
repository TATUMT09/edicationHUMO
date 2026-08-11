export const fields = {
  name: {
    type: 'string',
  },
  school: {
    type: 'string',
  },
  grade: {
    type: 'string',
  },
  group: {
    type: 'async',
    entity: 'group',
    dataIndex: ['group', 'name'],
    displayLabels: ['name'],
    outputValue: '_id',
  },
  phone: {
    type: 'phone',
  },
  birthday: {
    type: 'date',
  },
  address: {
    type: 'string',
  },
  email: {
    type: 'email',
  },
};
