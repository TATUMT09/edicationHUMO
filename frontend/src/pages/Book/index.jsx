import CrudModule from '@/modules/CrudModule/CrudModule';
import BookForm from './BookForm';
import { fields } from './config';

import useLanguage from '@/locale/useLanguage';

export default function Book() {
  const translate = useLanguage();
  const entity = 'book';
  const searchConfig = {
    displayLabels: ['title'],
    searchFields: 'title',
  };
  const deleteModalLabels = ['title'];

  const Labels = {
    PANEL_TITLE: translate('book'),
    DATATABLE_TITLE: translate('book_list'),
    ADD_NEW_ENTITY: translate('add_new_book'),
    ENTITY_NAME: translate('book'),
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
  return <CrudModule createForm={<BookForm />} updateForm={<BookForm />} config={config} />;
}
