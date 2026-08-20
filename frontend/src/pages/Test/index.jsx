import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';

import useLanguage from '@/locale/useLanguage';

export default function Test() {
  const translate = useLanguage();
  const entity = 'test';
  const searchConfig = {
    displayLabels: ['title'],
    searchFields: 'title',
  };
  const deleteModalLabels = ['title'];

  const Labels = {
    PANEL_TITLE: translate('test'),
    DATATABLE_TITLE: translate('test_list'),
    ADD_NEW_ENTITY: translate('add_new_test'),
    ENTITY_NAME: translate('test'),
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
    <CrudModule
      createForm={<DynamicForm fields={fields} />}
      updateForm={<DynamicForm fields={fields} />}
      config={config}
    />
  );
}
