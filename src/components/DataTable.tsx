import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';

interface Column<T> {
  header: string;
  accessorKey: keyof T;
  sortable?: boolean;
  cell?: (value: any) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  itemsPerPage?: number;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  itemsPerPage = 10,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: 'asc' | 'desc' | null;
  }>({
    key: null,
    direction: null,
  });

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return data;

    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const { pageItems, currentPage, totalPages, nextPage, previousPage, goToPage } =
    usePagination({
      totalItems: sortedData.length,
      itemsPerPage,
    });

  const currentData = useMemo(() => {
    return sortedData.slice(pageItems.start, pageItems.end);
  }, [sortedData, pageItems]);

  const handleSort = (key: keyof T) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key
          ? current.direction === 'asc'
            ? 'desc'
            : current.direction === 'desc'
            ? null
            : 'asc'
          : 'asc',
    }));
  };

  const getSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;
    if (sortConfig.key !== column.accessorKey) return <ChevronsUpDown size={16} />;
    if (sortConfig.direction === 'asc') return <ChevronUp size={16} />;
    if (sortConfig.direction === 'desc') return <ChevronDown size={16} />;
    return <ChevronsUpDown size={16} />;
  };

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={String(column.accessorKey)}
                  className={column.sortable ? 'cursor-pointer select-none' : ''}
                  onClick={() =>
                    column.sortable && handleSort(column.accessorKey)
                  }
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {getSortIcon(column)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column) => (
                  <TableCell key={String(column.accessorKey)}>
                    {column.cell
                      ? column.cell(row[column.accessorKey])
                      : row[column.accessorKey]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Página {currentPage} de {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
          >
            Primera
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={previousPage}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            Última
          </Button>
        </div>
      </div>
    </div>
  );
}
