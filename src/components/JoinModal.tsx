import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, X } from 'lucide-react';
import { api, ApiError } from '../api/client';
import { RECRUITMENT_CONFIG } from '../data/gdgData';

interface JoinModalProps { isOpen: boolean; onClose: () => void; defaultDepartment?: string; }
type Fields = Record<'fullName' | 'email' | 'phone' | 'studentId' | 'major' | 'semester' | 'facebookUrl' | 'nv1' | 'nv2' | 'portfolioUrl' | 'techStack' | 'nonTechSkills' | 'projectHighlight' | 'goals' | 'commitment' | 'message' | 'website', string>;
const emptyFields: Fields = { fullName: '', email: '', phone: '', studentId: '', major: '', semester: '', facebookUrl: '', nv1: '', nv2: '', portfolioUrl: '', techStack: '', nonTechSkills: '', projectHighlight: '', goals: '', commitment: '', message: '', website: '' };
const departments = ['AI', 'Cloud', 'Web Development', 'Research', 'Media', 'HR & Event'];
const majors = [['SE', 'Kỹ thuật phần mềm (SE)'], ['IA', 'An toàn thông tin (IA)'], ['AI', 'Trí tuệ nhân tạo (AI)'], ['GD', 'Thiết kế mỹ thuật số (GD)'], ['MC', 'Truyền thông đa phương tiện (MC)'], ['IB', 'Quản trị kinh doanh (IB)'], ['OTHER', 'Ngành khác']];
const semesters = [['FRESHMAN', 'Tân sinh viên'], ['SEM_1_3', 'Kỳ 1–3'], ['SEM_4_6', 'Kỳ 4–6'], ['SEM_7_PLUS', 'Kỳ 7+']];
const commitments = [['5_8_HOURS', 'Có thể dành tối thiểu 5–8 tiếng/tuần cho CLB'], ['WILL_ARRANGE', 'Lịch học khá bận nhưng sẽ cố gắng sắp xếp'], ['LIMITED', 'Khó đảm bảo thời gian thường xuyên']];
const steps = ['Thông tin cá nhân', 'Nguyện vọng', 'Năng lực', 'Cam kết'];
const inputClass = 'w-full rounded-xl border-2 border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100';

function guessDepartment(name = '') {
  const value = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (/research|nghien cuu/.test(value)) return 'Research';
  if (/cloud|dam may/.test(value)) return 'Cloud';
  if (/web/.test(value)) return 'Web Development';
  if (/media|truyen thong/.test(value)) return 'Media';
  if (/hr|nhan su|event/.test(value)) return 'HR & Event';
  if (/\bai\b|tri tue/.test(value)) return 'AI';
  return '';
}

export const JoinModal: React.FC<JoinModalProps> = ({ isOpen, onClose, defaultDepartment }) => {
  const [fields, setFields] = useState<Fields>({ ...emptyFields });
  const [step, setStep] = useState(0);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<{ enabled: boolean; cycleLabel: string } | null>(null);
  const [statusError, setStatusError] = useState(false);
  const [statusRetry, setStatusRetry] = useState(0);
  const [receipt, setReceipt] = useState<{ candidateId: string; cycleLabel: string } | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const scrollArea = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  const busyRef = useRef(busy);
  const requestId = useRef('');
  close.current = onClose;
  busyRef.current = busy;
  const isTech = ['AI', 'Cloud', 'Web Development', 'Research'].includes(fields.nv1);
  const change = (key: keyof Fields, value: string) => {
    setFields(previous => ({ ...previous, [key]: value, ...(key === 'nv1' && value === previous.nv2 ? { nv2: '' } : {}) }));
    requestId.current = '';
    setError('');
  };
  useEffect(() => {
    if (isOpen && defaultDepartment) setFields(previous => previous.nv1 ? previous : { ...previous, nv1: guessDepartment(defaultDepartment) });
  }, [isOpen, defaultDepartment]);
  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    setStatus(null); setStatusError(false);
    api.get<{ enabled: boolean; cycleLabel: string }>('/api/recruitment/status', { signal: controller.signal })
      .then(result => { if (!controller.signal.aborted) setStatus(result); }).catch(() => { if (!controller.signal.aborted) setStatusError(true); });
    return () => controller.abort();
  }, [isOpen, statusRetry]);
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busyRef.current) { event.preventDefault(); close.current(); }
      if (event.key !== 'Tab') return;
      const candidates = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]') || []) as HTMLElement[];
      const nodes = candidates.filter(node => node.offsetParent !== null && node.tabIndex >= 0);
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current || !dialog.current?.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current || !dialog.current?.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', keydown); previous?.focus(); };
  }, [isOpen]);

  if (!isOpen) return null;
  const advance = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busyRef.current || !form.current?.reportValidity()) return;
    if (step < 3) { setStep(step + 1); setError(''); scrollArea.current?.scrollTo({ top: 0 }); return; }
    if (!consent || !status?.enabled) return;
    busyRef.current = true;
    setBusy(true); setError('');
    try {
      if (!requestId.current) requestId.current = crypto.randomUUID();
      const result = await api.post<{ candidateId: string; cycleLabel: string }>('/api/recruitment/applications', {
        ...fields, fullName: fields.fullName.trim(), email: fields.email.trim(), phone: fields.phone.replace(/[\s.-]/g, ''), studentId: fields.studentId.trim().toUpperCase(),
        techStack: isTech ? fields.techStack : '', nonTechSkills: isTech ? '' : fields.nonTechSkills, consent, requestId: requestId.current,
      }, { signal: AbortSignal.timeout(40_000) });
      if (!/^UV\d{3,}$/.test(result.candidateId)) throw new Error('Chưa xác nhận được hồ sơ. Hãy giữ nguyên thông tin và thử gửi lại.');
      setReceipt(result); setFields({ ...emptyFields }); setConsent(false); requestId.current = ''; setStep(0);
    } catch (failure) {
      const retryMessage = 'Chưa xác nhận được hồ sơ. Hãy giữ nguyên thông tin và thử gửi lại.';
      setError(failure instanceof ApiError && failure.statusCode < 500 ? failure.message : retryMessage);
    } finally { busyRef.current = false; setBusy(false); }
  };
  const textField = (key: keyof Fields, label: string, options: { placeholder?: string; type?: string; area?: boolean; optional?: boolean; hint?: string; pattern?: string; minLength?: number; maxLength?: number; autoComplete?: string } = {}) => {
    const props = { id: `recruit-${key}`, name: key, value: fields[key], onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => change(key, event.target.value), required: !options.optional, maxLength: options.maxLength || (options.area ? 3000 : 1000), minLength: options.minLength, placeholder: options.placeholder, className: inputClass, 'aria-describedby': options.hint ? `hint-${key}` : undefined };
    return <div className={options.area ? 'sm:col-span-2' : ''} key={key}>
      <label htmlFor={props.id} className="mb-1.5 block text-sm font-bold">{label}{!options.optional && <span className="text-red-600"> *</span>}</label>
      {options.area ? <textarea {...props} rows={4} /> : <input {...props} type={options.type || 'text'} pattern={options.pattern} autoComplete={options.autoComplete} />}
      {options.hint && <p id={`hint-${key}`} className="mt-1 text-xs leading-relaxed text-slate-500">{options.hint}</p>}
    </div>;
  };
  const selectField = (key: keyof Fields, label: string, choices: string[][], optional = false) => <div key={key}>
    <label htmlFor={`recruit-${key}`} className="mb-1.5 block text-sm font-bold">{label}{!optional && <span className="text-red-600"> *</span>}</label>
    <select id={`recruit-${key}`} value={fields[key]} onChange={event => change(key, event.target.value)} required={!optional} className={inputClass}>
      <option value="">{optional ? 'Không có NV2' : 'Chọn một mục'}</option>
      {choices.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
    </select>
  </div>;
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6" onClick={() => { if (!busy) onClose(); }}>
    <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="recruitment-title" onClick={event => event.stopPropagation()} className="flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border-[2.5px] border-slate-900 bg-white text-slate-900 shadow-[6px_6px_0_#1e293b] outline-none">
      <header className="flex shrink-0 items-start justify-between gap-3 border-b-2 border-slate-900 bg-[#E8F0FE] px-5 py-4 sm:px-7">
        <div><p className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-700">GDGoC FPTU HCMC · {status?.cycleLabel || 'Tuyển thành viên'}</p><h2 id="recruitment-title" className="text-xl font-extrabold sm:text-2xl">{receipt ? 'Đã nhận hồ sơ của bạn!' : 'Ứng tuyển thành viên · Vòng 1'}</h2></div>
        <button type="button" aria-label="Đóng form ứng tuyển" disabled={busy} onClick={onClose} className="rounded-lg p-1 focus-visible:outline-2 disabled:opacity-40"><X /></button>
      </header>
      <div ref={scrollArea} className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
        {receipt ? <div className="space-y-5 py-6 text-center" role="status">
          <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" /><p>Hồ sơ đã được ghi nhận cho đợt <strong>{receipt.cycleLabel}</strong>.</p>
          <div className="inline-block rounded-2xl border-2 border-slate-900 bg-[#FFE7A5] px-10 py-5"><p className="text-xs font-bold uppercase">Mã ứng viên</p><p className="mt-2 font-mono text-4xl font-black">{receipt.candidateId}</p></div>
          <p className="text-sm text-slate-600">Lưu mã này để tra cứu với CLB. BCN sẽ xem hồ sơ và liên hệ qua email hoặc số điện thoại bạn cung cấp.</p>
          <button type="button" onClick={() => { setReceipt(null); onClose(); }} className="rounded-xl border-2 border-slate-900 px-6 py-3 font-bold">Hoàn tất</button>
        </div> : <>
          <ol aria-label="Tiến độ ứng tuyển" className="mb-6 grid grid-cols-4 gap-2">{steps.map((label, index) => <li key={label} aria-current={index === step ? 'step' : undefined} className={`rounded-xl border-2 p-2 text-center text-xs font-bold ${index === step ? 'border-slate-900 bg-[#FFE7A5]' : 'border-slate-200 bg-slate-50 text-slate-500'}`}><span className="block text-base">{index + 1}</span><span className="hidden sm:block">{label}</span></li>)}</ol>
          {statusError ? <div role="alert" className="mb-4 rounded-xl bg-amber-50 p-3 text-sm">Chưa kết nối được cổng tuyển. <button type="button" onClick={() => setStatusRetry(value => value + 1)} className="font-bold underline">Thử lại</button></div> : !status ? <p className="mb-4 text-sm text-slate-500">Đang kiểm tra đợt tuyển...</p> : (!RECRUITMENT_CONFIG.isOpen || !status.enabled) && (
            <div role="status" className="mb-5 rounded-2xl border-2 border-slate-900 bg-[#FFE7A5] p-4 text-xs sm:text-sm font-medium">
              <div className="flex items-center gap-2 font-extrabold text-slate-900 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="uppercase tracking-wide">Cổng Tuyển Thành Viên Đang Cập Nhật</span>
              </div>
              <p className="text-slate-800 leading-relaxed">
                {RECRUITMENT_CONFIG.noticeText} Bạn vẫn có thể xem trước các bước câu hỏi bên dưới để chuẩn bị hồ sơ tốt nhất!
              </p>
            </div>
          )}
          <form ref={form} onSubmit={event => void advance(event)}>
            <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
              <legend className="mb-4 text-lg font-extrabold">Bước {step + 1}: {steps[step]}</legend>
              {step === 0 && <>
                {textField('fullName', 'Họ và tên', { placeholder: 'Nguyễn Văn A', minLength: 2, maxLength: 120, autoComplete: 'name' })}
                {textField('email', 'Email FPT / Cá nhân', { type: 'email', placeholder: 'Email bạn thường kiểm tra', maxLength: 254, autoComplete: 'email' })}
                {textField('phone', 'Số điện thoại (Zalo)', { type: 'tel', pattern: '(0|\\+84)[0-9]{9,10}', placeholder: '0901234567', maxLength: 13, autoComplete: 'tel' })}
                {textField('studentId', 'Mã số sinh viên (MSSV)', { pattern: '[A-Za-z]{2,4}[0-9]{6,8}', placeholder: 'SE190000', maxLength: 12 })}
                {selectField('major', 'Chuyên ngành học', majors)}{selectField('semester', 'Kỳ học hiện tại', semesters)}
                {textField('facebookUrl', 'Link Facebook cá nhân', { type: 'url', pattern: 'https://.*', placeholder: 'https://facebook.com/username' })}
              </>}
              {step === 1 && <>
                {selectField('nv1', 'Ban nguyện vọng 1 (NV1)', departments.map(value => [value, value]))}
                {selectField('nv2', 'Ban nguyện vọng 2 (NV2)', departments.filter(value => value !== fields.nv1).map(value => [value, value]), true)}
                <p className="text-sm text-slate-500 sm:col-span-2">NV1 quyết định câu hỏi chuyên môn tiếp theo. NV2 không bắt buộc và phải khác NV1.</p>
              </>}
              {step === 2 && <>
                {textField('portfolioUrl', 'Link Portfolio / CV / Github / Sản phẩm', { type: 'url', pattern: 'https://.*', placeholder: 'https://github.com/username', hint: 'Dán link Github, Behance, Canva hoặc Google Drive và mở quyền xem. Nếu mới bắt đầu, có thể chia sẻ trang cá nhân hoặc bài tập.' })}
                {isTech ? textField('techStack', 'Công nghệ & công cụ bạn từng tiếp xúc hoặc muốn học sâu?', { area: true, placeholder: 'Python, React, Docker, Gemini API... Tân sinh viên mới tìm hiểu cũng đừng ngại chia sẻ.' }) : textField('nonTechSkills', 'Kỹ năng hoặc công cụ bạn tự tin nhất?', { area: true, placeholder: 'Figma, Photoshop, CapCut, viết content, lập kế hoạch sự kiện, giao tiếp...' })}
                {textField('projectHighlight', 'Dự án, hoạt động hoặc thành tích bạn tâm đắc nhất', { area: true, minLength: 10, maxLength: 5000, hint: 'Có thể là bài tập môn học, dự án cá nhân hoặc hoạt động bạn từng phụ trách.' })}
              </>}
              {step === 3 && <>
                {textField('goals', 'Mục tiêu lớn nhất khi gia nhập GDGoC FPTU?', { area: true, minLength: 10, maxLength: 5000, placeholder: 'Bạn muốn học gì, phát triển ra sao và cùng đồng đội làm điều gì?' })}
                <div className="sm:col-span-2"><p id="commitment-label" className="mb-2 text-sm font-bold">Mức độ cam kết thời gian <span className="text-red-600">*</span></p><div role="radiogroup" aria-labelledby="commitment-label" className="space-y-2">{commitments.map(([value, label]) => <label key={value} className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-slate-200 p-3 text-sm"><input type="radio" name="commitment" required value={value} checked={fields.commitment === value} onChange={() => change('commitment', value)} className="mt-0.5" /><span>{label}</span></label>)}</div></div>
                {textField('message', 'Câu hỏi hoặc lời nhắn dành cho CLB', { area: true, optional: true })}
                <label className="flex items-start gap-3 text-sm sm:col-span-2"><input type="checkbox" required checked={consent} onChange={event => { setConsent(event.target.checked); requestId.current = ''; }} className="mt-1" /><span>Tôi xác nhận thông tin đúng và đồng ý để CLB lưu hồ sơ, liên hệ phục vụ tuyển thành viên.</span></label>
              </>}
              <div hidden aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={fields.website} onChange={event => change('website', event.target.value)} /></label></div>
            </fieldset>
            {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <button type="button" disabled={busy || step === 0} onClick={() => { setStep(step - 1); setError(''); scrollArea.current?.scrollTo({ top: 0 }); }} className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-bold disabled:opacity-30"><ArrowLeft size={16} />Quay lại</button>
              <button type="submit" disabled={busy || (step === 3 && !status?.enabled)} className="flex items-center gap-2 rounded-xl border-2 border-slate-900 bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-[3px_3px_0_#1e293b] disabled:cursor-not-allowed disabled:opacity-50">{busy ? <><Loader2 size={16} className="animate-spin" />Đang gửi...</> : <>{step === 3 ? 'Nộp hồ sơ' : 'Tiếp tục'}<ArrowRight size={16} /></>}</button>
            </div>
          </form>
        </>}
      </div>
    </div>
  </div>;
};
