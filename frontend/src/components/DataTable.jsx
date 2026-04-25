import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const DataTable = ({ columns, data, loading, onRowClick, itemsPerPage = 10, exportName = "Export" }) => {
    const [currentPage, setCurrentPage] = useState(1);

    if (loading) {
        return (
            <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex justify-center items-center">
                <p className="text-gray-500 font-medium animate-pulse">Loading data...</p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex justify-center items-center">
                <p className="text-gray-500 font-medium">No records found.</p>
            </div>
        );
    }

    // Pagination logic
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = data.slice(startIndex, startIndex + itemsPerPage);

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    // Export to Excel logic
    const handleExport = () => {
        // Prepare data for export
        const exportData = data.map(row => {
            const newRow = {};
            columns.forEach(col => {
                if (col.header !== 'Actions') {
                    // Extract value, prioritizing raw accessor if cell component is complex
                    let value = row[col.accessor];
                    
                    // Specific overrides for known nested objects to make Excel clean
                    if (col.header === 'Name' && row.user) {
                        value = `${row.user.first_name} ${row.user.last_name}`;
                    } else if (col.header === 'Email' && row.user) {
                        value = row.user.email;
                    } else if (col.header === 'Percentage' && row.max_marks) {
                        value = ((row.marks_obtained / row.max_marks) * 100).toFixed(1) + '%';
                    }
                    
                    newRow[col.header] = value !== undefined ? value : '';
                }
            });
            return newRow;
        });

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
        XLSX.writeFile(workbook, `${exportName}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            {/* Toolbar */}
            <div className="flex justify-end p-2 border-b border-gray-100 bg-gray-50/30">
                <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                >
                    <Download className="w-4 h-4" />
                    Export Excel
                </button>
            </div>

            <div className="overflow-x-auto flex-1">
                <table className="w-full whitespace-nowrap">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            {columns.map((col, index) => (
                                <th 
                                    key={index}
                                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {currentData.map((row, rowIndex) => (
                            <tr 
                                key={rowIndex} 
                                onClick={() => onRowClick && onRowClick(row)}
                                className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : 'hover:bg-gray-50/50'}`}
                            >
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex} className="px-6 py-4 text-sm text-gray-700">
                                        {col.cell ? col.cell(row) : row[col.accessor]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
                    <span className="text-sm text-gray-500">
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, data.length)} of {data.length} entries
                    </span>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handlePrev}
                            disabled={currentPage === 1}
                            className="p-1 rounded-md text-gray-500 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-medium text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button 
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className="p-1 rounded-md text-gray-500 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
