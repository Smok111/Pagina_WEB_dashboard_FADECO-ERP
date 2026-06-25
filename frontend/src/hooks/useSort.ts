import { useState, useMemo } from 'react';

type SortOrder = 'asc' | 'desc';

export function useSort<T>(items: T[], defaultSortField: string, defaultSortOrder: SortOrder = 'asc') {
  const [sortField, setSortField] = useState<string>(defaultSortField);
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultSortOrder);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: any, b: any) => {
      // Resolve nested fields like 'categoria.nombre'
      const getVal = (obj: any, path: string) => path.split('.').reduce((acc, part) => acc && acc[part], obj);
      
      let valA = getVal(a, sortField);
      let valB = getVal(b, sortField);

      if (valA === undefined || valA === null) valA = "";
      if (valB === undefined || valB === null) valB = "";

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [items, sortField, sortOrder]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return { sortedItems, sortField, sortOrder, handleSort, setSortField, setSortOrder };
}
