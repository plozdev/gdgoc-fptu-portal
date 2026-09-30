import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  X, 
  UploadCloud, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  RefreshCw,
  Calendar,
  Layers
} from 'lucide-react';
import { useMemberStore, ExcelImportRow } from '../../store/useMemberStore';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableGens: string[];
  currentGen: string;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  availableGens,
  currentGen
}) => {
  const { importFromExcelFile, members, availableTenures, activeTenureId } = useMemberStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedTenureId, setSelectedTenureId] = useState<string>(activeTenureId || availableTenures[0]?.id || '');

  React.useEffect(() => {
    if (isOpen) {
      setSelectedTenureId(activeTenureId || availableTenures[0]?.id || '');
    }
  }, [isOpen, activeTenureId, availableTenures]);

  const [rawFile, setRawFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [parsingError, setParsingError] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ added: number; errors: string[] } | null>(null);

  if (!isOpen) return null;

  const chosenTenure = availableTenures.find(t => t.id === selectedTenureId);
  const targetGen = chosenTenure?.genLabel || chosenTenure?.name || currentGen;

  // Generate and download standard Excel template aligning with Backend Excel Parser
  const handleDownloadTemplate = () => {
    const headers = ['Họ và tên', 'MSSV', 'Email', 'Số điện thoại', 'Ban Chuyên Môn', 'Vai Trò', 'Position'];
    const sampleData = [
      headers,
      ['Nguyễn Hoàng Nam', 'SE184567', 'namnhse184567@fpt.edu.vn', '0912345678', 'TECH_AI', 'MEMBER', 'AI Member'],
      ['Trần Thị Bích Trâm', 'SE173890', 'tramttbse173890@fpt.edu.vn', '0934567890', 'MEDIA', 'DEPARTMENT_LEAD', 'Media Lead'],
      ['Lê Quốc Huy', 'SE190112', 'huylqse190112@fpt.edu.vn', '0987654321', 'TECH_CLOUD', 'MEMBER', 'Cloud Member'],
      ['Phan Thanh Hà', 'SE160234', 'haptse160234@fpt.edu.vn', '0978123456', 'HR_EVENT', 'MEMBER', 'HR-Event Member'],
      ['Phạm Hoàng Long', 'SE180099', 'longphse180099@fpt.edu.vn', '0901234567', 'TECH_WEB', 'MEMBER', 'Frontend Developer']
    ];

    const ws = XLSX.utils.aoa_to_sheet(sampleData);

    ws['!cols'] = [
      { wch: 24 }, // Họ và tên
      { wch: 14 }, // MSSV
      { wch: 32 }, // Email
      { wch: 16 }, // Số điện thoại
      { wch: 20 }, // Ban Chuyên Môn
      { wch: 18 }, // Vai Trò
      { wch: 20 }  // Position
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Thành Viên');
    XLSX.writeFile(wb, 'GDGoC_Member_Import_Template.xlsx');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRawFile(file);
    setFileName(file.name);
    setParsingError('');
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'array' });
        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];
        
        const data = XLSX.utils.sheet_to_json<any>(ws, { defval: '' });
        
        if (data.length === 0) {
          setParsingError('File Excel không có dữ liệu hoặc định dạng bảng trống.');
          setParsedRows([]);
          return;
        }

        const firstRow = data[0];
        const keys = Object.keys(firstRow).map(k => k.toLowerCase());
        const hasName = keys.some(k => k.includes('tên') || k.includes('name'));
        const hasMssv = keys.some(k => k.includes('mssv') || k.includes('mã số'));
        const hasEmail = keys.some(k => k.includes('email') || k.includes('mail'));

        if (!hasName || !hasMssv || !hasEmail) {
          setParsingError('File Excel không đúng định dạng! Bắt buộc có các cột: "Họ và tên", "MSSV", "Email", "Ban Chuyên Môn". Hãy tải file mẫu để kiểm tra.');
          setParsedRows([]);
          return;
        }

        setParsedRows(data);
      } catch (err: any) {
        setParsingError('Lỗi đọc file Excel: ' + (err.message || 'Định dạng file không hỗ trợ'));
        setParsedRows([]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirmImport = async () => {
    if (!rawFile) return;
    setIsImporting(true);
    try {
      const result = await importFromExcelFile(rawFile);
      setImportResult(result);
    } catch (err: any) {
      setParsingError(err.response?.data?.message || err.message || 'Lỗi tải file lên máy chủ');
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setRawFile(null);
    setFileName('');
    setParsedRows([]);
    setParsingError('');
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Nhập Danh Sách Thành Viên Từ Excel (.xlsx)
              </h3>
              <p className="text-xs text-slate-500">
                Đồng bộ hàng loạt nhân sự vào nhiệm kỳ với chuẩn định dạng Backend GDGoC Portal
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Top Info & Download Template */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Quy chuẩn 7 cột file Excel (Chuẩn Backend):</span>
              </div>
              <p className="text-xs text-blue-700 font-mono-code">
                Họ và tên | MSSV | Email | SĐT | Ban Chuyên Môn (TECH_AI, MEDIA...) | Vai Trò | Position
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-blue-700 font-bold text-xs rounded-xl border border-blue-300 shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Tải File Excel Mẫu (.xlsx)</span>
            </button>
          </div>

          {/* Tenure Selection for Import */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Nhiệm Kỳ Áp Dụng Cho Đợt Nhập:</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono-code">Tenure Database ID</span>
            </div>

            <select
              value={selectedTenureId}
              onChange={(e) => setSelectedTenureId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
            >
              {availableTenures.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.genLabel} {t.id === activeTenureId ? '(Đang hoạt động)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Upload Area */}
          {!fileName && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/20 rounded-2xl p-8 text-center cursor-pointer transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
                <UploadCloud className="w-7 h-7 text-blue-600" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Nhấp để chọn file Excel (.xlsx / .csv) từ máy tính
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Hỗ trợ định dạng bảng tính Microsoft Excel (.xlsx, .xls, .csv)
              </p>
            </div>
          )}

          {/* Parsing Error */}
          {parsingError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Không thể đọc dữ liệu:</p>
                <p>{parsingError}</p>
              </div>
            </div>
          )}

          {/* Import Result Notification */}
          {importResult && (
            <div className={`p-4 rounded-xl border ${
              importResult.added > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Nhập thành công {importResult.added} thành viên mới vào {targetGen}!</span>
              </div>
              {importResult.errors.length > 0 && (
                <div className="mt-2 text-xs space-y-1">
                  <p className="font-semibold text-amber-800">Có {importResult.errors.length} dòng bị bỏ qua do trùng hoặc thiếu thông tin:</p>
                  <ul className="list-disc pl-5 space-y-0.5 max-h-32 overflow-y-auto text-amber-700">
                    {importResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Preview Table */}
          {parsedRows.length > 0 && !importResult && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-800">
                    Xem trước dữ liệu ({parsedRows.length} dòng phát hiện)
                  </span>
                  <span className="text-[11px] px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded-md font-mono-code">
                    {fileName}
                  </span>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Chọn file khác</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="px-3 py-2">STT</th>
                      <th className="px-3 py-2">Họ và Tên</th>
                      <th className="px-3 py-2">MSSV</th>
                      <th className="px-3 py-2">Email FPT</th>
                      <th className="px-3 py-2">Ban</th>
                      <th className="px-3 py-2">Vai Trò</th>
                      <th className="px-3 py-2">Position</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((row, idx) => {
                      const name = row['Họ và tên'] || row['Họ tên'] || row['Full Name'] || row['name'] || '';
                      const mssv = row['MSSV'] || row['Mã số'] || row['studentId'] || '';
                      const email = row['Email'] || row['email'] || '';
                      const dept = row['Ban Chuyên Môn'] || row['Ban'] || row['department'] || '';
                      const role = row['Vai Trò'] || row['Role'] || 'MEMBER';
                      const pos = row['Position'] || row['Chức danh'] || '';

                      const emailExists = members.some(m => m.email.toLowerCase() === email.toLowerCase());
                      const isInvalid = !name || !mssv || !email;

                      return (
                        <tr key={idx} className={isInvalid ? 'bg-red-50/50' : emailExists ? 'bg-amber-50/40' : 'hover:bg-slate-50'}>
                          <td className="px-3 py-2 font-mono-code text-slate-400">{idx + 1}</td>
                          <td className="px-3 py-2 font-bold text-slate-800">{name || <span className="text-red-500 font-normal">Thiếu tên</span>}</td>
                          <td className="px-3 py-2 font-mono-code font-bold text-slate-700">{mssv || <span className="text-red-500 font-normal">Thiếu</span>}</td>
                          <td className="px-3 py-2 font-mono-code">
                            {email}
                            {emailExists && <span className="text-amber-600 ml-1 text-[10px] font-bold">(Đã có)</span>}
                          </td>
                          <td className="px-3 py-2 font-semibold text-blue-700">{dept || 'Mặc định'}</td>
                          <td className="px-3 py-2 font-mono-code text-[11px]">{role}</td>
                          <td className="px-3 py-2">
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                              {pos || 'Thành Viên'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Nhiệm kỳ áp dụng: <strong className="text-slate-800">{targetGen}</strong>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              {importResult ? 'Đóng' : 'Hủy'}
            </button>

            {!importResult && parsedRows.length > 0 && (
              <button
                type="button"
                disabled={isImporting}
                onClick={handleConfirmImport}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isImporting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Đang Nhập Dữ Liệu Lên DB...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Xác Nhận Nhập ({parsedRows.length} Thành Viên)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
