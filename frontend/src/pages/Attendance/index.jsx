import { useEffect, useState } from 'react';
import { Select, DatePicker, Table, Switch, Button, Card, message, Empty, Tag, List } from 'antd';
import { SaveOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { request } from '@/request';
import useResponsive from '@/hooks/useResponsive';

export default function Attendance() {
  const { isMobile } = useResponsive();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(undefined);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [students, setStudents] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [recordIdMap, setRecordIdMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    request.listAll({ entity: 'group' }).then((res) => {
      if (res.success) setGroups(res.result);
    });
  }, []);

  useEffect(() => {
    if (!selectedGroup) {
      setStudents([]);
      return;
    }
    setIsLoading(true);
    Promise.all([
      request.filter({ entity: 'client', options: { filter: 'group', equal: selectedGroup } }),
      request.filter({ entity: 'attendance', options: { filter: 'group', equal: selectedGroup } }),
    ]).then(([studentsRes, attendanceRes]) => {
      setStudents(studentsRes.success ? studentsRes.result : []);

      const dateStr = selectedDate.format('YYYY-MM-DD');
      const newStatusMap = {};
      const newRecordIdMap = {};
      (attendanceRes.success ? attendanceRes.result : [])
        .filter((rec) => rec.date === dateStr)
        .forEach((rec) => {
          const studentId = rec.student?._id || rec.student;
          newStatusMap[studentId] = rec.status;
          newRecordIdMap[studentId] = rec._id;
        });
      setStatusMap(newStatusMap);
      setRecordIdMap(newRecordIdMap);
      setIsLoading(false);
    });
  }, [selectedGroup, selectedDate]);

  const toggleStatus = (studentId) => {
    setStatusMap((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'absent' ? 'present' : 'absent',
    }));
  };

  const handleSave = async () => {
    if (!selectedGroup) return;
    setIsSaving(true);
    const dateStr = selectedDate.format('YYYY-MM-DD');

    await Promise.all(
      students.map((student) => {
        const status = statusMap[student._id] || 'present';
        const existingId = recordIdMap[student._id];
        if (existingId) {
          return request.update({
            entity: 'attendance',
            id: existingId,
            jsonData: { status },
          });
        }
        return request.create({
          entity: 'attendance',
          jsonData: { student: student._id, group: selectedGroup, date: dateStr, status },
        });
      })
    );

    setIsSaving(false);
    message.success('Davomat saqlandi');
  };

  const presentCount = students.filter((s) => (statusMap[s._id] || 'present') === 'present').length;

  const StatusSwitch = ({ student }) => {
    const status = statusMap[student._id] || 'present';
    return (
      <Switch
        checked={status === 'present'}
        checkedChildren={<CheckOutlined />}
        unCheckedChildren={<CloseOutlined />}
        onChange={() => toggleStatus(student._id)}
      />
    );
  };

  const columns = [
    {
      title: "O'quvchi",
      dataIndex: 'name',
    },
    {
      title: 'Holat',
      dataIndex: '_id',
      render: (_, student) => <StatusSwitch student={student} />,
    },
  ];

  return (
    <Card title="Davomat" bodyStyle={isMobile ? { padding: '12px' } : undefined}>
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        <Select
          placeholder="Guruhni tanlang"
          style={{ width: isMobile ? '100%' : 240 }}
          value={selectedGroup}
          onChange={setSelectedGroup}
          options={groups.map((g) => ({ value: g._id, label: g.name }))}
        />
        <DatePicker
          value={selectedDate}
          onChange={(date) => date && setSelectedDate(date)}
          allowClear={false}
          style={isMobile ? { width: '100%' } : undefined}
        />
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={isSaving}
          disabled={!selectedGroup || students.length === 0}
          block={isMobile}
        >
          Saqlash
        </Button>
        {selectedGroup && students.length > 0 && (
          <Tag
            color="blue"
            style={{
              fontSize: '14px',
              padding: '4px 10px',
              alignSelf: isMobile ? 'flex-start' : 'center',
            }}
          >
            Keldi: {presentCount} / {students.length}
          </Tag>
        )}
      </div>

      {!selectedGroup ? (
        <Empty description="Guruhni tanlang" />
      ) : isMobile ? (
        <List
          bordered
          loading={isLoading}
          dataSource={students}
          renderItem={(student) => (
            <List.Item
              key={student._id}
              actions={[<StatusSwitch key="switch" student={student} />]}
            >
              {student.name}
            </List.Item>
          )}
        />
      ) : (
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={students}
          loading={isLoading}
          pagination={false}
          scroll={{ x: true }}
        />
      )}
    </Card>
  );
}
