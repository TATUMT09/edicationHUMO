// Only drives the DataTable's columns — Question's actual create/update UI
// is the bespoke QuestionForm (needs a repeatable options[] list, which
// DynamicForm's static `select`/`array` types can't express).
export const fields = {
  test: {
    type: 'async',
    entity: 'test',
    dataIndex: ['test', 'title'],
    displayLabels: ['title'],
    outputValue: '_id',
    label: 'test',
  },
  prompt: {
    type: 'string',
    label: 'prompt',
  },
  questionType: {
    type: 'string',
    label: 'question_type',
  },
  points: {
    type: 'number',
    label: 'points',
  },
};
