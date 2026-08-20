import CrudModule from '@/modules/CrudModule/CrudModule';
import QuestionForm from './QuestionForm';
import { fields } from './config';

import useLanguage from '@/locale/useLanguage';

export default function Question() {
  const translate = useLanguage();
  const entity = 'question';
  const searchConfig = {
    displayLabels: ['prompt'],
    searchFields: 'prompt',
  };
  const deleteModalLabels = ['prompt'];

  const Labels = {
    PANEL_TITLE: translate('question'),
    DATATABLE_TITLE: translate('question_list'),
    ADD_NEW_ENTITY: translate('add_new_question'),
    ENTITY_NAME: translate('question'),
  };
  const configPage = {
    entity,
    ...Labels,
  };
  const config = {
    ...configPage,
    fields,
    searchConfig,
    deleteModalLabels,
  };
  return (
    <CrudModule createForm={<QuestionForm />} updateForm={<QuestionForm />} config={config} />
  );
}
