import { useEffect, useState } from 'react';

const STORAGE_KEY = 'humo_attendance_last_group';

// Remembers the last group picked (across Davomat / Davomat hisoboti) so an
// admin who always works with the same group never has to pick it again —
// and falls back to the only/first group once the list loads.
export default function useLastSelectedGroup(groups) {
  const [selectedGroup, setSelectedGroupState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || undefined
  );

  useEffect(() => {
    if (groups.length === 0) return;
    const stillExists = groups.some((g) => g._id === selectedGroup);
    if (!stillExists) {
      setSelectedGroupState(groups[0]._id);
    }
  }, [groups]);

  const setSelectedGroup = (groupId) => {
    setSelectedGroupState(groupId);
    if (groupId) localStorage.setItem(STORAGE_KEY, groupId);
  };

  return [selectedGroup, setSelectedGroup];
}
