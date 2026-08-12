import { useEffect, useMemo, useState } from 'react';
import { Select, DatePicker, Table, Card, Empty, Tag, Button, Space, List } from 'antd';
import { CheckOutlined, CloseOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { request } from '@/request';
import useResponsive from '@/hooks/useResponsive';

function csvCell(value) {
  const str = String(value ?? '');
  return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
  // Leading BOM so Excel opens the UTF-8 file with Uzbek/Cyrillic text intact.
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AttendanceReport() {
  const { isMobile } = useResponsive();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(undefined);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    request.listAll({ entity: 'group' }).then((res) => {
      if (res.success) setGroups(res.result);
    });
  }, []);

  useEffect(() => {
    if (!selectedGroup) {
      setStudents([]);
      setRecords([]);
      return;
    }
    setIsLoading(true);
    Promise.all([
      request.filter({ entity: 'client', options: { filter: 'group', equal: selectedGroup } }),
      request.filter({ entity: 'attendance', options: { filter: 'group', equal: selectedGroup } }),
    ]).then(([studentsRes, attendanceRes]) => {
      setStudents(studentsRes.success ? studentsRes.result : []);
      setRecords(attendanceRes.success ? attendanceRes.result : []);
      setIsLoading(false);
    });
  }, [selectedGroup]);

  const monthPrefix = selectedMonth.format('YYYY-MM');

  // Every calendar day of the selected month is a column, like a paper
  // attendance register — days with no record yet just render as "—".
  const days = useMemo(() => {
    const daysInMonth = selectedMonth.daysInMonth();
    const arr = [];
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push(selectedMonth.date(d).format('YYYY-MM-DD'));
    }
    return arr;
  }, [selectedMonth]);

  const statusByStudentDate = useMemo(() => {
    const map = {};
    records
      .filter((r) => r.date.startsWith(monthPrefix))
      .forEach((r) => {
        const studentId = r.student?._id || r.student;
        if (!map[studentId]) map[studentId] = {};
        map[studentId][r.date] = r.status;
      });
    return map;
  }, [records, monthPrefix]);

  const studentTotals = (studentId) => {
    const byDate = statusByStudentDate[studentId] || {};
    const total = Object.keys(byDate).length;
    const present = Object.values(byDate).filter((s) => s === 'present').length;
    return { present, absent: total - present, total };
  };

  // On a narrow phone a 30-column grid buries the one thing that actually
  // matters — which days a student was absent — behind horizontal scrolling.
  // The mobile list surfaces those days directly instead.
  const absentDays = (studentId) => {
    const byDate = statusByStudentDate[studentId] || {};
    return Object.entries(byDate)
      .filter(([, status]) => status === 'absent')
      .map(([date]) => dayjs(date).format('DD'))
      .sort();
  };

  const renderCell = (status) => {
    if (status === 'present') return <CheckOutlined style={{ color: '#389e0d' }} />;
    if (status === 'absent') return <CloseOutlined style={{ color: '#cf1322' }} />;
    return <span style={{ color: '#bfbfbf' }}>—</span>;
  };

  const columns = [
    {
      title: "O'quvchi",
      dataIndex: 'name',
      fixed: 'left',
      width: 160,
    },
    ...days.map((date) => ({
      title: dayjs(date).format('DD'),
      key: date,
      width: 44,
      align: 'center',
      render: (_, student) => renderCell(statusByStudentDate[student._id]?.[date]),
    })),
    {
      title: 'Keldi',
      key: 'present',
      fixed: 'right',
      width: 80,
      align: 'center',
      render: (_, student) => {
        const { present, total } = studentTotals(student._id);
        return <Tag color="blue">{`${present}/${total}`}</Tag>;
      },
    },
    {
      title: 'Foiz',
      key: 'percent',
      fixed: 'right',
      width: 70,
      align: 'center',
      render: (_, student) => {
        const { present, total } = studentTotals(student._id);
        if (!total) return '—';
        return `${Math.round((present / total) * 100)}%`;
      },
    },
  ];

  const handleExport = () => {
    const groupName = groups.find((g) => g._id === selectedGroup)?.name || '';
    const header = ["O'quvchi", ...days.map((d) => dayjs(d).format('DD.MM')), 'Keldi', 'Jami', 'Foiz'];
    const rows = students.map((student) => {
      const { present, total } = studentTotals(student._id);
      const cells = days.map((date) => {
        const status = statusByStudentDate[student._id]?.[date];
        return status === 'present' ? '+' : status === 'absent' ? '-' : '';
      });
      const percent = total ? `${Math.round((present / total) * 100)}%` : '';
      return [student.name, ...cells, present, total, percent];
    });
    downloadCsv(`davomat_${groupName}_${monthPrefix}.csv`, [header, ...rows]);
  };

  return (
    <Card title="Davomat hisoboti" styles={{ body: isMobile ? { padding: '12px' } : undefined }}>
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
        <DatePicker
          picker="month"
          value={selectedMonth}
          onChange={(date) => date && setSelectedMonth(date)}
          allowClear={false}
          style={isMobile ? { width: '100%' } : undefined}
        />
        <Button
          icon={<DownloadOutlined />}
          onClick={handleExport}
          disabled={!selectedGroup || students.length === 0}
          block={isMobile}
        >
          Excelga yuklab olish
        </Button>
      </Space>

      {!selectedGroup ? (
        <Empty description="Guruhni tanlang" />
      ) : !isLoading && students.length === 0 ? (
        <Empty description="Bu guruhda o'quvchi topilmadi" />
      ) : isMobile ? (
        <List
          bordered
          loading={isLoading}
          dataSource={students}
          renderItem={(student) => {
            const { present, total } = studentTotals(student._id);
            const absent = absentDays(student._id);
            const percent = total ? `${Math.round((present / total) * 100)}%` : '—';
            return (
              <List.Item key={student._id}>
                <div style={{ width: '100%' }}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <b>{student.name}</b>
                    <Space>
                      <Tag color="blue">{`${present}/${total}`}</Tag>
                      <Tag color={present === total && total > 0 ? 'green' : 'orange'}>{percent}</Tag>
                    </Space>
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    {absent.length > 0 ? (
                      <>
                        <span style={{ color: '#cf1322' }}>Kelmagan kunlari: </span>
                        {absent.map((d) => (
                          <Tag color="red" key={d} style={{ marginBottom: '4px' }}>
                            {d}
                          </Tag>
                        ))}
                      </>
                    ) : total > 0 ? (
                      <span style={{ color: '#389e0d' }}>Barcha kunlarga keldi</span>
                    ) : (
                      <span style={{ color: '#bfbfbf' }}>Bu oyda davomat olinmagan</span>
                    )}
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
      ) : (
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={students}
          loading={isLoading}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      )}
    </Card>
  );
}
