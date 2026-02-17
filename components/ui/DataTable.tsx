"use client";

import { useState, useMemo, ReactNode } from "react";
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import EmptyState from "@/components/ui/EmptyState";

interface Column<T> {
    key: keyof T | string;
    header: string;
    sortable?: boolean;
    render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    isLoading?: boolean;
    searchable?: boolean;
    searchPlaceholder?: string;
    searchKeys?: (keyof T)[];
    emptyTitle?: string;
    emptyDescription?: string;
}

type SortDirection = "asc" | "desc" | null;

export default function DataTable<T extends Record<string, unknown>>({
    data,
    columns,
    isLoading = false,
    searchable = true,
    searchPlaceholder = "Search...",
    searchKeys = [],
    emptyTitle = "No data found",
    emptyDescription,
}: DataTableProps<T>) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    // Filter data based on search
    const filteredData = useMemo(() => {
        if (!searchQuery || searchKeys.length === 0) return data;

        const query = searchQuery.toLowerCase();
        return data.filter((item) =>
            searchKeys.some((key) => {
                const value = item[key];
                if (typeof value === "string") {
                    return value.toLowerCase().includes(query);
                }
                if (typeof value === "number") {
                    return value.toString().includes(query);
                }
                return false;
            })
        );
    }, [data, searchQuery, searchKeys]);

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortKey || !sortDirection) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];

            if (aValue === bValue) return 0;
            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            const comparison = aValue < bValue ? -1 : 1;
            return sortDirection === "asc" ? comparison : -comparison;
        });
    }, [filteredData, sortKey, sortDirection]);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            // Cycle through: asc -> desc -> null
            if (sortDirection === "asc") {
                setSortDirection("desc");
            } else if (sortDirection === "desc") {
                setSortDirection(null);
                setSortKey(null);
            } else {
                setSortDirection("asc");
            }
        } else {
            setSortKey(key);
            setSortDirection("asc");
        }
    };

    const getSortIcon = (key: string) => {
        if (sortKey !== key) {
            return <ChevronsUpDown className="w-4 h-4 text-muted-foreground" />;
        }
        if (sortDirection === "asc") {
            return <ChevronUp className="w-4 h-4" />;
        }
        if (sortDirection === "desc") {
            return <ChevronDown className="w-4 h-4" />;
        }
        return <ChevronsUpDown className="w-4 h-4 text-muted-foreground" />;
    };

    if (isLoading) {
        return <LoadingSkeleton variant="table-row" count={5} />;
    }

    return (
        <div className="space-y-4">
            {/* Search */}
            {searchable && (
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            )}

            {/* Table */}
            {sortedData.length === 0 ? (
                <EmptyState title={emptyTitle} description={emptyDescription} />
            ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    {columns.map((column) => (
                                        <th
                                            key={String(column.key)}
                                            className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"
                                        >
                                            {column.sortable ? (
                                                <button
                                                    onClick={() => handleSort(String(column.key))}
                                                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                                                >
                                                    {column.header}
                                                    {getSortIcon(String(column.key))}
                                                </button>
                                            ) : (
                                                column.header
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {sortedData.map((item, index) => (
                                    <tr key={index} className="hover:bg-muted/30 transition-colors">
                                        {columns.map((column) => (
                                            <td
                                                key={String(column.key)}
                                                className="px-4 py-4 text-sm"
                                            >
                                                {column.render
                                                    ? column.render(item)
                                                    : String(item[column.key as keyof T] ?? "")}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
