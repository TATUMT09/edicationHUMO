import { useEffect, useState } from 'react';
import { Select, DatePicker, Table, Switch, Button, Card, message, Empty, Tag, List } from 'antd';
import { SaveOutlined, SendOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { request } from '@/request';
import useResponsive from '@/hooks/useResponsive';

// Defined outside Attendance so its identity is stable across renders —
// an inline closure would make React remount the <Switch> on every toggle.
function StatusSwitch({ status, onToggle }) {
  return (
    <Switch
      checked={status === 'present'}
      checkedChildren={<CheckOutlined />}
      unCheckedChildren={<CloseOutlined />}
      onChange={onToggle}
    />
  );
}

export default function Attendance() {
  const { isMobile } = useResponsive();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(undefined);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [students, setStudents] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [originalStatusMap, setOriginalStatusMap] = useState({});
  const [recordIdMap, setRecordIdMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingNotice, setIsSendingNotice] = useState(false);

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
      setOriginalStatusMap(newStatusMap);
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

  // A student needs saving if their status actually changed, OR if they have
  // no record yet at all (e.g. left at the default "keldi" and never
  // toggled) — without this, untouched students never get an Attendance
  // record created, so "Xabar yuborish" silently skips them since it only
  // looks at records that exist in the database.
  const saveAttendance = async () => {
    const dateStr = selectedDate.format('YYYY-MM-DD');
    const studentsNeedingSave = students.filter((student) => {
      const currentStatus = statusMap[student._id] || 'present';
      if (!recordIdMap[student._id]) return true;
      return currentStatus !== originalStatusMap[student._id];
    });

    const newRecordIdMap = { ...recordIdMap };
    const finalStatusMap = { ...statusMap };

    await Promise.all(
      studentsNeedingSave.map(async (student) => {
        const status = statusMap[student._id] || 'present';
        finalStatusMap[student._id] = status;
        const existingId = recordIdMap[student._id];
        if (existingId) {
          return request.update({
            entity: 'attendance',
            id: existingId,
            jsonData: { status },
          });
        }
        const res = await request.create({
          entity: 'attendance',
          jsonData: { student: student._id, group: selectedGroup, date: dateStr, status },
        });
        if (res.success) newRecordIdMap[student._id] = res.result._id;
      })
    );

    setStatusMap(finalStatusMap);
    setOriginalStatusMap(finalStatusMap);
    setRecordIdMap(newRecordIdMap);
    return studentsNeedingSave.length;
  };

  const handleSave = async () => {
    if (!selectedGroup) return;
    setIsSaving(true);
    const savedCount = await saveAttendance();
    setIsSaving(false);
    message.success(savedCount > 0 ? 'Davomat saqlandi' : "O'zgarish yo'q edi");
  };

  const handleSendNotice = async () => {
    if (!selectedGroup) return;
    setIsSendingNotice(true);
    // Make sure every student's current status is actually persisted before
    // asking the backend to notify parents — otherwise students who were
    // never explicitly toggled (still at the default "keldi") have no
    // Attendance record yet and get silently skipped.
    await saveAttendance();
    const dateStr = selectedDate.format('YYYY-MM-DD');
    const res = await request.post({
      entity: 'notify/attendance-status',
      jsonData: { group: selectedGroup, date: dateStr },
    });
    setIsSendingNotice(false);
    if (res.success) {
      message.success(res.message);
    }
  };

  const presentCount = students.filter((s) => (statusMap[s._id] || 'present') === 'present').length;

  const columns = [
    {
      title: "O'quvchi",
      dataIndex: 'name',
    },
    {
      title: 'Holat',
      dataIndex: '_id',
      render: (_, student) => (
        <StatusSwitch
          status={statusMap[student._id] || 'present'}
          onToggle={() => toggleStatus(student._id)}
        />
      ),
    },
  ];

  return (
    <Card title="Davomat" styles={{ body: isMobile ? { padding: '12px' } : undefined }}>
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
        <Button
          icon={<SendOutlined />}
          onClick={handleSendNotice}
          loading={isSendingNotice}
          disabled={!selectedGroup || students.length === 0}
          block={isMobile}
        >
          Xabar yuborish
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
              actions={[
                <StatusSwitch
                  key="switch"
                  status={statusMap[student._id] || 'present'}
                  onToggle={() => toggleStatus(student._id)}
                />,
              ]}
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
