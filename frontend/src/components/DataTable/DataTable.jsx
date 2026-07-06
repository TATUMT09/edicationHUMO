import { useCallback, useEffect } from 'react';

import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  RedoOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { Dropdown, Table, Button, Input, List, Pagination } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';

import { useSelector, useDispatch } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectListItems } from '@/redux/crud/selectors';
import useLanguage from '@/locale/useLanguage';
import { dataForTable } from '@/utils/dataStructure';
import { useMoney, useDate } from '@/settings';
import useResponsive from '@/hooks/useResponsive';
import { get } from '@/utils/helpers';

import { generate as uniqueId } from 'shortid';

import { useCrudContext } from '@/context/crud';

function AddNewItem({ config, isMobile }) {
  const { crudContextAction } = useCrudContext();
  const { collapsedBox, panel } = crudContextAction;
  const { ADD_NEW_ENTITY } = config;

  const handelClick = () => {
    panel.open();
    collapsedBox.close();
  };

  return (
    <Button onClick={handelClick} type="primary" block={isMobile}>
      {ADD_NEW_ENTITY}
    </Button>
  );
}
export default function DataTable({ config, extra = [] }) {
  let { entity, dataTableColumns, DATATABLE_TITLE, fields, searchConfig } = config;
  const { crudContextAction } = useCrudContext();
  const { panel, collapsedBox, modal, readBox, editBox, advancedBox } = crudContextAction;
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();
  const { isMobile } = useResponsive();

  const items = [
    {
      label: translate('Show'),
      key: 'read',
      icon: <EyeOutlined />,
    },
    {
      label: translate('Edit'),
      key: 'edit',
      icon: <EditOutlined />,
    },
    ...extra,
    {
      type: 'divider',
    },

    {
      label: translate('Delete'),
      key: 'delete',
      icon: <DeleteOutlined />,
    },
  ];

  const handleRead = (record) => {
    dispatch(crud.currentItem({ data: record }));
    panel.open();
    collapsedBox.open();
    readBox.open();
  };
  function handleEdit(record) {
    dispatch(crud.currentItem({ data: record }));
    dispatch(crud.currentAction({ actionType: 'update', data: record }));
    editBox.open();
    panel.open();
    collapsedBox.open();
  }
  function handleDelete(record) {
    dispatch(crud.currentAction({ actionType: 'delete', data: record }));
    modal.open();
  }

  function handleUpdatePassword(record) {
    dispatch(crud.currentItem({ data: record }));
    dispatch(crud.currentAction({ actionType: 'update', data: record }));
    advancedBox.open();
    panel.open();
    collapsedBox.open();
  }

  let dispatchColumns = [];
  if (fields) {
    dispatchColumns = [...dataForTable({ fields, translate, moneyFormatter, dateFormat })];
  } else {
    dispatchColumns = [...dataTableColumns];
  }

  const ActionMenu = ({ record }) => (
    <Dropdown
      menu={{
        items,
        onClick: ({ key }) => {
          switch (key) {
            case 'read':
              handleRead(record);
              break;
            case 'edit':
              handleEdit(record);
              break;

            case 'delete':
              handleDelete(record);
              break;
            case 'updatePassword':
              handleUpdatePassword(record);
              break;

            default:
              break;
          }
          // else if (key === '2')handleCloseTask
        },
      }}
      trigger={['click']}
    >
      <EllipsisOutlined
        style={{ cursor: 'pointer', fontSize: '24px' }}
        onClick={(e) => e.preventDefault()}
      />
    </Dropdown>
  );

  dataTableColumns = [
    ...dispatchColumns,
    {
      title: '',
      key: 'action',
      fixed: 'right',
      render: (_, record) => <ActionMenu record={record} />,
    },
  ];

  const { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);

  const { pagination, items: dataSource } = listResult;

  const dispatch = useDispatch();

  const handelDataTableLoad = useCallback((pagination) => {
    const options = { page: pagination.current || 1, items: pagination.pageSize || 10 };
    dispatch(crud.list({ entity, options }));
  }, []);

  const filterTable = (e) => {
    const value = e.target.value;
    const options = { q: value, fields: searchConfig?.searchFields || '' };
    dispatch(crud.list({ entity, options }));
  };

  const dispatcher = () => {
    dispatch(crud.list({ entity }));
  };

  useEffect(() => {
    const controller = new AbortController();
    dispatcher();
    return () => {
      controller.abort();
    };
  }, []);

  return (
    <>
      <PageHeader
        onBack={() => window.history.back()}
        backIcon={<ArrowLeftOutlined />}
        title={DATATABLE_TITLE}
        ghost={false}
        extra={[
          <div
            key="dataTableControls"
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              flexDirection: isMobile ? 'column' : 'row',
              width: isMobile ? '100%' : undefined,
            }}
          >
            <Input
              onChange={filterTable}
              placeholder={translate('search')}
              allowClear
              style={isMobile ? { width: '100%' } : undefined}
            />
            <Button
              onClick={handelDataTableLoad}
              icon={<RedoOutlined />}
              block={isMobile}
            >
              {translate('Refresh')}
            </Button>
            <AddNewItem config={config} isMobile={isMobile} />
          </div>,
        ]}
        style={{
          padding: '20px 0px',
        }}
      ></PageHeader>

      {isMobile ? (
        <>
          <List
            bordered
            loading={listIsLoading}
            dataSource={dataSource}
            renderItem={(record) => {
              const displayColumns = dataTableColumns.slice(0, -1);
              return (
                <List.Item key={record._id}>
                  <div style={{ width: '100%' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '8px',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {displayColumns.map((col, idx) => {
                          const rawValue = Array.isArray(col.dataIndex)
                            ? get(record, col.dataIndex.join('.'))
                            : get(record, col.dataIndex);
                          const content = col.render ? col.render(rawValue, record) : rawValue;
                          if (content === undefined || content === null || content === '')
                            return null;
                          return (
                            <div key={col.key || idx} style={{ marginBottom: '4px' }}>
                              {col.title ? (
                                <span style={{ color: '#999', fontSize: '12px' }}>
                                  {col.title}:{' '}
                                </span>
                              ) : null}
                              <span>{content}</span>
                            </div>
                          );
                        })}
                      </div>
                      <ActionMenu record={record} />
                    </div>
                  </div>
                </List.Item>
              );
            }}
          />
          {pagination && (
            <Pagination
              current={pagination.page}
              total={pagination.count}
              pageSize={10}
              onChange={(page, pageSize) => handelDataTableLoad({ current: page, pageSize })}
              style={{ marginTop: '16px', textAlign: 'center' }}
            />
          )}
        </>
      ) : (
        <Table
          columns={dataTableColumns}
          rowKey={(item) => item._id}
          dataSource={dataSource}
          pagination={pagination}
          loading={listIsLoading}
          onChange={handelDataTableLoad}
          scroll={{ x: true }}
        />
      )}
    </>
  );
}
