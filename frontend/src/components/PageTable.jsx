import React, { useState, useMemo } from 'react';
import { Search, ExternalLink, Download, FileText, Check, Copy, ChevronLeft, ChevronRight } from 'lucide-react';

export const PageTable = ({ pages = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const filteredPages = useMemo(() => {
    return pages.filter((page) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        page.url.toLowerCase().includes(q) ||
        (page.title && page.title.toLowerCase().includes(q));

      let matchesStatus = true;
      if (statusFilter === '200') {
        matchesStatus = page.statusCode === 200;
      } else if (statusFilter === '4XX') {
        matchesStatus = page.statusCode >= 400 && page.statusCode < 500;
      } else if (statusFilter === '5XX') {
        matchesStatus = page.statusCode >= 500;
      } else if (statusFilter === 'ERR') {
        matchesStatus = !page.statusCode || page.statusCode === 0;
      }

      return matchesSearch && matchesStatus;
    });
  }, [pages, searchQuery, statusFilter]);

  // Reset to page 1 on filter or search change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredPages.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPages = filteredPages.slice(startIndex, startIndex + pageSize);

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(pages, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `crawled_pages_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'URL', 'Status Code', 'Title', 'Depth', 'Discovered At'];
    const rows = pages.map((p) => [
      p.id,
      `"${p.url.replace(/"/g, '""')}"`,
      p.statusCode || 0,
      `"${(p.title || '').replace(/"/g, '""')}"`,
      p.depth,
      p.createdAt,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `crawled_pages_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getStatusBadge = (statusCode) => {
    if (statusCode === 200) {
      return (
        <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          200 OK
        </span>
      );
    }
    if (statusCode >= 300 && statusCode < 400) {
      return (
        <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
          {statusCode}
        </span>
      );
    }
    if (statusCode >= 400 && statusCode < 500) {
      return (
        <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          {statusCode}
        </span>
      );
    }
    return (
      <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
        {statusCode || 'ERR'}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex flex-1 items-center space-x-2">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by URL or title..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="200">200 OK</option>
            <option value="4XX">4xx Errors</option>
            <option value="5XX">5xx Errors</option>
            <option value="ERR">Errors / Other</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-medium">
            {filteredPages.length} {filteredPages.length === 1 ? 'page' : 'pages'}
          </span>
          <button
            onClick={handleExportCsv}
            disabled={pages.length === 0}
            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportJson}
            disabled={pages.length === 0}
            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-40"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
              <th className="py-2.5 px-3 w-10 text-center">#</th>
              <th className="py-2.5 px-3 min-w-[260px]">URL</th>
              <th className="py-2.5 px-3 w-24 text-center">Status</th>
              <th className="py-2.5 px-3 min-w-[180px]">Page Title</th>
              <th className="py-2.5 px-3 w-16 text-center">Depth</th>
              <th className="py-2.5 px-3 w-16 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {paginatedPages.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                  {pages.length === 0 ? 'No pages discovered yet.' : 'No pages match your filter query.'}
                </td>
              </tr>
            ) : (
              paginatedPages.map((page, index) => {
                const globalIndex = startIndex + index + 1;
                return (
                  <tr
                    key={page.id || globalIndex}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2 px-3 text-center font-mono text-slate-400 text-[11px]">
                      {globalIndex}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center space-x-1.5 font-mono text-slate-900 dark:text-slate-100">
                        <a
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-emerald-600 hover:underline truncate max-w-sm sm:max-w-md block text-[11px]"
                        >
                          {page.url}
                        </a>
                        <a
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-center">
                      {getStatusBadge(page.statusCode)}
                    </td>
                    <td className="py-2 px-3 text-slate-800 dark:text-slate-200 truncate max-w-xs text-xs">
                      {page.title || <span className="text-slate-400 italic">No Title</span>}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="inline-block px-1.5 py-0.5 rounded font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        d={page.depth}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => handleCopy(page.url, page.id || globalIndex)}
                        title="Copy URL"
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        {copiedId === (page.id || globalIndex) ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredPages.length > 0 && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-2">
            <span>
              Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredPages.length)} of {filteredPages.length} pages
            </span>
            <div className="flex items-center space-x-1 ml-2">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="py-0.5 px-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageTable;

