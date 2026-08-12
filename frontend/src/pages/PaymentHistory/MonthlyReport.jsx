import { useEffect, useMemo, useState } from 'react';
import { Select, Table, Card, Empty, Tag, Button, Space, Tooltip } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { request } from '@/request';
import useResponsive from '@/hooks/useResponsive';

function formatSom(value) {
  return `${(value || 0).toLocaleString('ru-RU')} so'm`;
}

// 'paid' / 'partial' / 'unpaid' / null (no record for that month yet)
function paymentStatus(rec) {
  if (!rec) return null;
  const remaining = (rec.amount || 0) - (rec.paidAmount || 0);
  if ((rec.amount || 0) > 0 && remaining <= 0) return 'paid';
  if ((rec.paidAmount || 0) > 0) return 'partial';
  return 'unpaid';
}

const STATUS_META = {
  paid: { color: 'green', label: "To'langan" },
  partial: { color: 'orange', label: 'Qisman' },
  unpaid: { color: 'red', label: "To'lanmagan" },
};

function csvCell(value) {
  const str = String(value ?? '');
  return /[;",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function downloadCsv(filename, rows) {
  // Uzbek/Russian-locale Excel expects ";" as the field separator (comma is
  // the decimal separator there), so a plain comma-CSV opens as one column.
  // The "sep=;" hint line tells Excel explicitly, regardless of locale.
  const csv = ['sep=;', ...rows.map((row) => row.map(csvCell).join(';'))].join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function PaymentReport() {
  const { isMobile } = useResponsive();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(undefined);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState(undefined);

  useEffect(() => {
    request.listAll({ entity: 'group' }).then((res) => {
      if (res.success) setGroups(res.result);
    });
  }, []);

  useEffect(() => {
    setStatusFilter(undefined);
    if (!selectedGroup) {
      setStudents([]);
      setRecords([]);
      return;
    }
    setIsLoading(true);
    Promise.all([
      request.filter({ entity: 'client', options: { filter: 'group', equal: selectedGroup } }),
      request.filter({ entity: 'monthlypayment', options: { filter: 'group', equal: selectedGroup } }),
    ]).then(([studentsRes, paymentsRes]) => {
      setStudents(studentsRes.success ? studentsRes.result : []);
      setRecords(paymentsRes.success ? paymentsRes.result : []);
      setIsLoading(false);
    });
  }, [selectedGroup]);

  // Columns are only the months that actually have a payment record for this
  // group — a brand-new group shouldn't render a dozen empty month columns.
  const months = useMemo(() => [...new Set(records.map((r) => r.month))].sort(), [records]);

  const recordByStudentMonth = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      const studentId = r.student?._id || r.student;
      if (!map[studentId]) map[studentId] = {};
      map[studentId][r.month] = r;
    });
    return map;
  }, [records]);

  // Missing record for the current month counts as unpaid — matches how the
  // Dashboard and "Oylik to'lovlar" page treat a student nobody has charged yet.
  const currentMonth = dayjs().format('YYYY-MM');
  const currentStatus = (studentId) => paymentStatus(recordByStudentMonth[studentId]?.[currentMonth]) || 'unpaid';

  const filteredStudents = statusFilter
    ? students.filter((s) => currentStatus(s._id) === statusFilter)
    : students;

  const statusCounts = students.reduce(
    (acc, s) => {
      acc[currentStatus(s._id)] += 1;
      return acc;
    },
    { paid: 0, partial: 0, unpaid: 0 }
  );

  const toggleStatusFilter = (status) => {
    setStatusFilter((prev) => (prev === status ? undefined : status));
  };

  const renderCell = (rec) => {
    const status = paymentStatus(rec);
    if (!status) return <span style={{ color: '#bfbfbf' }}>—</span>;
    const meta = STATUS_META[status];
    return (
      <Tooltip title={`${formatSom(rec.paidAmount)} / ${formatSom(rec.amount)}`}>
        <Tag color={meta.color} style={{ marginRight: 0, minWidth: 34, textAlign: 'center' }}>
          {meta.label === "To'langan" ? '✓' : meta.label === 'Qisman' ? '½' : '✕'}
        </Tag>
      </Tooltip>
    );
  };

  const columns = [
    {
      title: "O'quvchi",
      dataIndex: 'name',
      fixed: 'left',
      width: 160,
    },
    ...months.map((month) => ({
      title: month,
      key: month,
      width: 70,
      align: 'center',
      render: (_, student) => renderCell(recordByStudentMonth[student._id]?.[month]),
    })),
  ];

  const handleExport = () => {
    const groupName = groups.find((g) => g._id === selectedGroup)?.name || '';
    const header = ["O'quvchi", ...months];
    const rows = students.map((student) => {
      const cells = months.map((month) => {
        const status = paymentStatus(recordByStudentMonth[student._id]?.[month]);
        return status ? STATUS_META[status].label : '';
      });
      return [student.name, ...cells];
    });
    downloadCsv(`tolovlar_${groupName}.csv`, [header, ...rows]);
  };

  return (
    <Card title="To'lovlar hisoboti" styles={{ body: isMobile ? { padding: '12px' } : undefined }}>
      <Space
        wrap
        style={{ marginBottom: '20px', width: isMobile ? '100%' : undefined }}
        direction={isMobile ? 'vertical' : 'horizontal'}
      >
        <Select
          placeholder="Guruhni tanlang"
          style={{ width: isMobile ? '100%' : 240 }}
          value={selectedGroup}
          onChange={setSelectedGroup}
          options={groups.map((g) => ({ value: g._id, label: g.name }))}
        />
        <Button
          icon={<DownloadOutlined />}
          onClick={handleExport}
          disabled={!selectedGroup || months.length === 0}
          block={isMobile}
        >
          Excelga yuklab olish
        </Button>
        {selectedGroup && (
          <Space wrap>
            {[
              { status: 'paid', color: 'green', label: `✓ To'langan (${statusCounts.paid})` },
              { status: 'partial', color: 'orange', label: `½ Qisman (${statusCounts.partial})` },
              { status: 'unpaid', color: 'red', label: `✕ To'lanmagan (${statusCounts.unpaid})` },
            ].map(({ status, color, label }) => (
              <Tag.CheckableTag
                key={status}
                checked={statusFilter === status}
                onChange={() => toggleStatusFilter(status)}
                style={{
                  border: `1px solid var(--ant-${color}-6, ${color})`,
                  color: statusFilter === status ? '#fff' : undefined,
                  backgroundColor:
                    statusFilter === status
                      ? { green: '#389e0d', orange: '#d48806', red: '#cf1322' }[color]
                      : undefined,
                }}
              >
                {label}
              </Tag.CheckableTag>
            ))}
          </Space>
        )}
      </Space>

      {!selectedGroup ? (
        <Empty description="Guruhni tanlang" />
      ) : !isLoading && months.length === 0 ? (
        <Empty description="Bu guruh uchun to'lov yozuvlari topilmadi" />
      ) : (
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={filteredStudents}
          loading={isLoading}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      )}
    </Card>
  );
}
