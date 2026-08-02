import React, { useState } from 'react';
import { FileSpreadsheet, Download, FileText, BarChart, CheckCircle2, Shield } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import api from '../services/api';
import { Toast, ToastMessage } from '../components/Toast';

export const ReportsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'employees' | 'gaps' | 'trainings'>('gaps');
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const exportPDF = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reports/${activeTab}`);
      if (!res.data.success) return;

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`OKGIP - ${res.data.report_title}`, 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated At: ${new Date(res.data.generated_at).toLocaleString()}`, 14, 28);

      const tableData = res.data.data;
      if (activeTab === 'gaps') {
        autoTable(doc, {
          startY: 35,
          head: [['Employee', 'Department', 'Skill', 'Req Prof', 'Curr Prof', 'Gap', 'Priority', 'Status']],
          body: tableData.map((row: any) => [
            row.employee_name,
            row.department,
            row.skill_name,
            row.required_proficiency,
            row.current_proficiency,
            row.gap_score,
            row.priority,
            row.status,
          ]),
        });
      } else if (activeTab === 'employees') {
        autoTable(doc, {
          startY: 35,
          head: [['Name', 'Department', 'Designation', 'Skills Count', 'High Gaps', 'Status']],
          body: tableData.map((row: any) => [
            row.employee_name,
            row.department,
            row.designation,
            row.skills_count,
            row.high_gaps_count,
            row.status,
          ]),
        });
      } else {
        autoTable(doc, {
          startY: 35,
          head: [['Program', 'Employee', 'Department', 'Status', 'Progress %', 'Due Date']],
          body: tableData.map((row: any) => [
            row.program_title,
            row.employee_name,
            row.department,
            row.status,
            `${row.progress_percentage}%`,
            row.due_date,
          ]),
        });
      }

      doc.save(`OKGIP_${activeTab}_report.pdf`);
      addToast('success', 'PDF Downloaded', `OKGIP_${activeTab}_report.pdf generated.`);
    } catch (err) {
      addToast('error', 'PDF Export Failed');
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reports/${activeTab}`);
      if (!res.data.success) return;

      const worksheet = XLSX.utils.json_to_sheet(res.data.data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'OKGIP Data');

      XLSX.writeFile(workbook, `OKGIP_${activeTab}_report.xlsx`);
      addToast('success', 'Excel Exported', `OKGIP_${activeTab}_report.xlsx downloaded.`);
    } catch (err) {
      addToast('error', 'Excel Export Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      <Toast toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            Executive Reports & Data Export Center
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Generate and export institutional knowledge gap, employee competency, and training audit reports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportPDF}
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-3.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={exportExcel}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-3.5 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('gaps')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'gaps'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Knowledge Gap Matrix Report
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'employees'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Employee Competency Report
        </button>
        <button
          onClick={() => setActiveTab('trainings')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'trainings'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Training Completion & Progress Report
        </button>
      </div>

      {/* Preview Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 capitalize">
            {activeTab} Analytics Summary & Export Configuration
          </h2>
          <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px] font-bold">
            Ready for PDF/Excel generation
          </span>
        </div>

        <p className="text-slate-600 leading-relaxed text-xs font-medium">
          Click either <strong>Export PDF</strong> or <strong>Export Excel</strong> above to download the full,
          unabridged enterprise report containing real-time employee assessments, skill deficit rankings, and program
          completion histories.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <h3 className="font-bold text-slate-900 mb-1">Standardized Layout</h3>
            <p className="text-slate-500 text-[11px] font-medium">Formatted with table headers, timestamps, and page numbers.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <h3 className="font-bold text-slate-900 mb-1">Role-Based Data</h3>
            <p className="text-slate-500 text-[11px] font-medium">Aggregates cross-departmental records for executive audit.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <h3 className="font-bold text-slate-900 mb-1">Instant Processing</h3>
            <p className="text-slate-500 text-[11px] font-medium">Calculated directly from live backend database endpoints.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
