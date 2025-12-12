import { useEffect, useCallback, useMemo, useState } from "react";

interface UseSelectionManagerOptions<T> {
  items: T[];
  getId: (item: T) => string;
  selectedModeActive: boolean;
}

interface UseSelectionManagerReturn {
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  lastSelectedIndex: number | null;
  setLastSelectedIndex: React.Dispatch<React.SetStateAction<number | null>>;
  itemIdList: string[];
  toggleAll: () => void;
  toggleSelection: (itemId: string, index: number, range: boolean) => void;
  clearSelection: () => void;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
}

export function useSelectionManager<T>(
  options: UseSelectionManagerOptions<T>
): UseSelectionManagerReturn {
  const { items, getId, selectedModeActive } = options;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );

  const itemIdList = useMemo(() => items.map(getId), [items, getId]);

  // Clear selection when selected mode is deactivated
  useEffect(() => {
    if (!selectedModeActive) {
      setSelectedIds([]);
      setLastSelectedIndex(null);
    }
  }, [selectedModeActive]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    setLastSelectedIndex(null);
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedIds.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(getId));
    }
  }, [items, getId, selectedIds]);

  const toggleSelection = useCallback(
    (itemId: string, index: number, range: boolean) => {
      if (range && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        const rangeIds = itemIdList.slice(start, end + 1);
        setSelectedIds((prev) => Array.from(new Set([...prev, ...rangeIds])));
      } else {
        setSelectedIds((prev) =>
          prev.includes(itemId)
            ? prev.filter((id) => id !== itemId)
            : [...prev, itemId]
        );
        setLastSelectedIndex(index);
      }
    },
    [itemIdList, lastSelectedIndex]
  );

  const isAllSelected = selectedIds.length === items.length && items.length > 0;
  const isPartiallySelected =
    selectedIds.length > 0 && selectedIds.length < items.length;

  return {
    selectedIds,
    setSelectedIds,
    lastSelectedIndex,
    setLastSelectedIndex,
    itemIdList,
    toggleAll,
    toggleSelection,
    clearSelection,
    isAllSelected,
    isPartiallySelected,
  };
}
