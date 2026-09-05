import { useEffect, useMemo, useState } from 'react';
import { Select, DatePicker, Table, Card, Empty, Tag, Button, Space } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

import { request } from '@/request';
import useResponsive from '@/hooks/useResponsive';
import useLastSelectedGroup from '@/hooks/useLastSelectedGroup';

// A real .xlsx sidesteps CSV's locale-dependent delimiter ("," vs ";")
// entirely — cells land in real columns no matter how Excel is configured.
function downloadXlsx(filename, rows) {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Davomat');
  XLSX.writeFile(wb, filename);
}

export default function AttendanceReport() {
  const { isMobile } = useResponsive();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useLastSelectedGroup(groups);
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

  // Only days the group actually had a lesson (i.e. has at least one
  // attendance record) become a column — a group meeting 3x/week has ~13
  // columns a month, not 30, which is what actually makes the whole month
  // fit on a phone screen instead of needing to scroll through blank days.
  const days = useMemo(() => {
    const dates = new Set(records.filter((r) => r.date.startsWith(monthPrefix)).map((r) => r.date));
    return [...dates].sort();
  }, [records, monthPrefix]);

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

  const renderCell = (status) => {
    const size = isMobile ? 16 : 20;
    const style = {
      width: size,
      height: size,
      lineHeight: `${size}px`,
      borderRadius: 4,
      display: 'inline-block',
      fontSize: isMobile ? 10 : 12,
      color: '#fff',
    };
    if (status === 'present') return <span style={{ ...style, background: '#389e0d' }}>+</span>;
    if (status === 'absent') return <span style={{ ...style, background: '#cf1322' }}>-</span>;
    return <span style={{ color: '#d9d9d9' }}>—</span>;
  };

  const columns = [
    {
      title: "O'quvchi",
      dataIndex: 'name',
      fixed: 'left',
      width: isMobile ? 82 : 160,
      ellipsis: true,
    },
    ...days.map((date) => ({
      title: dayjs(date).format('DD'),
      key: date,
      width: isMobile ? 22 : 44,
      align: 'center',
      render: (_, student) => renderCell(statusByStudentDate[student._id]?.[date]),
    })),
    ...(isMobile
      ? [
          {
            title: 'Natija',
            key: 'result',
            fixed: 'right',
            width: 56,
            align: 'center',
            render: (_, student) => {
              const { present, total } = studentTotals(student._id);
              const percent = total ? Math.round((present / total) * 100) : null;
              return (
                <div style={{ fontSize: 11, lineHeight: 1.3 }}>
                  <div>{`${present}/${total}`}</div>
                  <div style={{ color: '#8c8c8c' }}>{percent !== null ? `${percent}%` : '—'}</div>
                </div>
              );
            },
          },
        ]
      : [
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
        ]),
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
    downloadXlsx(`davomat_${groupName}_${monthPrefix}.xlsx`, [header, ...rows]);
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
          size="large"
          style={{ width: isMobile ? '100%' : 240 }}
          value={selectedGroup}
          onChange={setSelectedGroup}
          options={groups.map((g) => ({ value: g._id, label: g.name }))}
        />
        <DatePicker
          size="large"
          picker="month"
          value={selectedMonth}
          onChange={(date) => date && setSelectedMonth(date)}
          allowClear={false}
          style={isMobile ? { width: '100%' } : undefined}
        />
        {selectedGroup && students.length > 0 && days.length > 0 && (
          <Button
            size="large"
            icon={<DownloadOutlined />}
            onClick={handleExport}
            block={isMobile}
          >
            Excelga yuklab olish
          </Button>
        )}
      </Space>

      {!selectedGroup ? (
        <Empty description="Guruhni tanlang" />
      ) : !isLoading && students.length === 0 ? (
        <Empty description="Bu guruhda o'quvchi topilmadi" />
      ) : !isLoading && days.length === 0 ? (
        <Empty description="Bu oyda davomat hali belgilanmagan" />
      ) : (
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={students}
          loading={isLoading}
          pagination={false}
          size={isMobile ? 'small' : 'middle'}
          tableLayout="fixed"
          scroll={{ x: 'max-content' }}
          style={isMobile ? { fontSize: 12 } : undefined}
        />
      )}
    </Card>
  );
}
