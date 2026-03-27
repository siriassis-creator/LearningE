import { useState } from 'react';

// --- Types ---
type ContentModule = { id: number; title: string; type: 'video' | 'pdf'; url: string; };
type Question = { id: number; text: string; options: string[]; correctAnswer: number; };
type Instructor = { id: number; name: string; role: string; description: string; image: string; };
type Course = {
  id: number; title: string; image: string; intro: string; isActive: boolean; 
  passingPercentage: number; instructors: Instructor[]; contents: ContentModule[]; exam: Question[];
};
type SystemSettings = {
  orgName: string; signatoryName: string; signatoryTitle: string; logoUrl: string; signatureUrl: string;
};

// ฟังก์ชันแปลงลิงก์ YouTube
const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return '';
  let videoId = '';
  if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
  else if (url.includes('youtube.com/watch')) videoId = new URL(url).searchParams.get('v') || '';
  else if (url.includes('youtube.com/embed/')) return url; 
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};

// ฟังก์ชันแปลงวันที่ปัจจุบันเป็นภาษาไทยแบบเป็นทางการ
const getThaiDateString = () => {
  const d = new Date();
  const months = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  return `${d.getDate()} เดือน${months[d.getMonth()]} พุทธศักราช ${d.getFullYear() + 543}`;
};

// ข้อมูลจำลองเริ่มต้น
const initialCourses: Course[] = [
  { 
    id: 1, title: 'ระเบียบงานสารบรรณ พ.ศ. 2566', image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=400&h=250', 
    intro: 'หลักสูตรพื้นฐานสำหรับบุคลากรทางการศึกษา เพื่อให้เข้าใจถึงระเบียบข้อบังคับ และการจัดทำหนังสือราชการได้อย่างถูกต้องตามมาตรฐานสากล', 
    isActive: true, passingPercentage: 80,
    instructors: [{ id: 1, name: 'อ. สมชาย รักเรียน', role: 'ผู้เชี่ยวชาญ สพป.ชัยภูมิ เขต 2', description: 'รับผิดชอบการออกแบบและพัฒนาเนื้อหาการเรียนรู้ผ่านสื่ออิเล็กทรอนิกส์ (E-Learning) เพื่อสนับสนุนและพัฒนาศักยภาพบุคลากรทางการศึกษา', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200' }],
    contents: [
      { id: 1, title: 'บทนำงานสารบรรณ (วิดีโอ)', type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { id: 2, title: 'เอกสารประกอบการเรียน (PDF)', type: 'pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
    ],
    exam: [
      { id: 1, text: 'หนังสือราชการมีกี่ชนิด?', options: ['4 ชนิด', '5 ชนิด', '6 ชนิด', '7 ชนิด'], correctAnswer: 2 },
      { id: 2, text: 'ข้อใดคือส่วนประกอบที่สำคัญที่สุดของหนังสือราชการ?', options: ['ตราครุฑ', 'วันที่', 'ลายมือชื่อ', 'เนื้อหาใจความ'], correctAnswer: 3 }
    ]
  }
];

const initialSettings: SystemSettings = {
  orgName: 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษาชัยภูมิ เขต 2',
  signatoryName: '(นายสมชาย ตัวอย่าง)',
  signatoryTitle: 'ผู้อำนวยการสำนักงานเขตพื้นที่การศึกษาประถมศึกษาชัยภูมิ เขต 2',
  logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/ตรากระทรวงศึกษาธิการ.svg/400px-ตรากระทรวงศึกษาธิการ.svg.png',
  signatureUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Signature_of_John_Hancock.svg/300px-Signature_of_John_Hancock.svg.png' 
};

const currentUser = { name: 'นางสาวกศิมาตย์ ทองเนียม', role: 'ผู้ดูแลระบบและผู้เรียน' }; 

// --- [1] หน้า Login ---
const LoginView = ({ onLogin }: { onLogin: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-slate-200"><h1 className="text-2xl font-bold text-center mb-6 text-slate-800">ระบบ E-Learning</h1><button onClick={onLogin} className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800 transition font-bold shadow-md">เข้าสู่ระบบ (Demo)</button></div>
  </div>
);

// --- ✅ ใบประกาศนียบัตร (Certificate Modal) ---
const CertificateModal = ({ course, settings, onClose }: { course: Course, settings: SystemSettings, onClose: () => void }) => {
  const printCertificate = () => { window.print(); };
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 print:p-0 print:bg-white overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden print:shadow-none print:w-[297mm] print:h-[210mm] relative">
        <div className="bg-slate-100 p-4 flex justify-between items-center border-b print:hidden sticky top-0 z-50">
          <h3 className="font-bold text-slate-700">📜 ตัวอย่างใบวุฒิบัตร</h3>
          <div className="flex gap-3">
            <button onClick={printCertificate} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow-sm">🖨️ พิมพ์ / บันทึก PDF</button>
            <button onClick={onClose} className="bg-slate-300 hover:bg-slate-400 text-slate-800 px-6 py-2 rounded-lg font-bold">ปิดหน้าต่าง</button>
          </div>
        </div>

        <div className="p-8 print:p-0 flex justify-center bg-gray-50 print:bg-white min-h-[600px]">
          <div className="w-full aspect-[1.414/1] bg-white border-[16px] border-blue-900 p-2 relative shadow-inner flex flex-col items-center justify-center text-center">
            <div className="absolute inset-2 border-4 border-blue-900 opacity-80 pointer-events-none"></div>
            <img src={settings.logoUrl} alt="Logo" className="h-24 md:h-28 lg:h-32 mb-4 object-contain" />
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-blue-900 mb-2">{settings.orgName}</h1>
            <p className="text-lg md:text-xl font-medium text-slate-700 mb-8">ขอมอบวุฒิบัตรฉบับนี้ให้ไว้เพื่อแสดงว่า</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-8">{currentUser.name}</h2>
            <p className="text-base md:text-lg font-medium text-slate-700 mb-1">ได้ผ่านการเรียนรู้ผ่านสื่ออิเล็กทรอนิกส์</p>
            <p className="text-lg md:text-xl font-bold text-blue-900 mb-1">หลักสูตร {course.title}</p>
            <p className="text-base md:text-lg font-medium text-slate-700 mb-6">ผลการประเมิน <span className="font-bold text-green-700">"ผ่าน"</span></p>
            <p className="text-sm md:text-base font-medium text-slate-600 mb-1">ขอให้มีความเจริญ สุขสวัสดิ์ และประสบความสำเร็จในหน้าที่การงานสืบไป</p>
            <p className="text-sm md:text-base font-medium text-slate-600 mb-12">ให้ไว้เมื่อวันที่ {getThaiDateString()}</p>
            <div className="flex flex-col items-center mt-auto mb-4">
              <img src={settings.signatureUrl} alt="Signature" className="h-12 md:h-16 mb-2 object-contain" />
              <p className="font-bold text-slate-800 text-sm md:text-base">{settings.signatoryName}</p>
              <p className="text-xs md:text-sm text-slate-600">{settings.signatoryTitle}</p>
            </div>
            <div className="absolute bottom-6 right-8 flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-200 border border-slate-300 flex items-center justify-center text-[10px] text-slate-400 mb-1 rounded-sm">QR<br/>Code</div>
              <p className="text-[10px] text-slate-500">เลขที่วุฒิบัตร {(Math.random() * 10000).toFixed(0).padStart(5, '0')}/{(new Date().getFullYear() + 543)}</p>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media print { body * { visibility: hidden; } .fixed.inset-0, .fixed.inset-0 * { visibility: visible; } .fixed.inset-0 { position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: white !important; } @page { size: A4 landscape; margin: 0; } }`}</style>
    </div>
  );
};

// --- [2] หน้าแรกสำหรับผู้เรียน ---
const CourseCatalogView = ({ courses, onViewCourse, settings }: { courses: Course[], onViewCourse: (c: Course) => void, settings: SystemSettings }) => {
  const activeCourses = courses.filter(c => c.isActive);
  return (
    <div className="space-y-8 animate-fade-in w-full">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-l-4 border-l-blue-900 relative overflow-hidden">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">🎓 การเรียนรู้ผ่านสื่ออิเล็กทรอนิกส์ (E-Learning)</h2>
        <p className="text-slate-600 relative z-10 leading-relaxed">การเรียนรู้ผ่านสื่ออิเล็กทรอนิกส์ (E-Learning) ของ <strong className="text-blue-700">{settings.orgName}</strong> จัดทำขึ้นเพื่อเป็นสื่อกลางในการเรียนรู้ทางออนไลน์ สำหรับผู้บริหารโรงเรียน ครู บุคลากรทางการศึกษา และประชาชนทั่วไป เพื่อพัฒนาความรู้ ความสามารถ และความสนใจ</p>
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-800 border-b pb-4 mb-6">📚 หลักสูตรที่เปิดสอน ({activeCourses.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {activeCourses.map(course => (
            <div key={course.id} onClick={() => onViewCourse(course)} className="bg-white rounded-xl shadow-sm border cursor-pointer hover:shadow-md hover:-translate-y-1 transition flex flex-col overflow-hidden">
              <img src={course.image} alt={course.title} className="h-48 w-full object-cover" />
              <div className="p-5 flex-1 flex flex-col justify-between">
                <h3 className="font-bold text-slate-800 line-clamp-2 leading-tight">{course.title}</h3>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200">เปิดเรียน</span>
                  <span className="text-xs text-slate-500 font-bold flex items-center gap-1">👨‍🏫 {course.instructors.length} ท่าน</span>
                </div>
              </div>
            </div>
          ))}
          {activeCourses.length === 0 && <p className="text-slate-500 col-span-full text-center py-10 bg-white rounded-xl border border-dashed">ยังไม่มีหลักสูตรที่เปิดสอนในขณะนี้</p>}
        </div>
      </div>
    </div>
  );
};

// --- [3] หน้ารายละเอียดการเรียน และระบบทำข้อสอบ ---
const CourseDetailView = ({ course, settings, onBack }: { course: Course, settings: SystemSettings, onBack: () => void }) => {
  const [activeTab, setActiveTab] = useState<string>('content'); 
  const [activeLesson, setActiveLesson] = useState<ContentModule | null>(course.contents[0] || null);
  const [examState, setExamState] = useState<'intro' | 'taking' | 'result'>('intro');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState({ correct: 0, total: 0, percentage: 0 });
  const [showCertificate, setShowCertificate] = useState(false);

  const handleStartExam = () => { setAnswers({}); setExamState('taking'); };
  const handleSubmitExam = () => {
    let correctCount = 0;
    course.exam.forEach(q => { if (answers[q.id] === q.correctAnswer) correctCount++; });
    const percent = Math.round((correctCount / course.exam.length) * 100);
    setScore({ correct: correctCount, total: course.exam.length, percentage: percent });
    setExamState('result');
  };

  return (
    <div className="space-y-4 animate-fade-in w-full relative">
      <button onClick={onBack} className="text-blue-600 hover:text-blue-900 flex items-center gap-2 font-bold bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg inline-flex transition"><span>⬅️</span> กลับไปหน้าหลักสูตร</button>
      
      {showCertificate && <CertificateModal course={course} settings={settings} onClose={() => setShowCertificate(false)} />}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full flex flex-col">
        
        {/* 🔴 ปรับลดความสูง (จาก h-64 เป็น h-32/h-40) และปรับขนาดฟอนต์ให้เล็กลง */}
        <div className="h-32 lg:h-40 bg-blue-900 text-white p-6 lg:p-8 flex flex-col justify-end relative overflow-hidden shrink-0">
           <img src={course.image} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="bg" />
           <div className="absolute inset-0 bg-gradient-to-t from-blue-900 to-transparent opacity-80"></div>
           <h2 className="text-2xl lg:text-3xl font-bold relative z-10 leading-tight">{course.title}</h2>
        </div>

        {/* 🔴 ปรับความสูงของแถบเมนู (Tabs) ให้บางลง */}
        <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto scrollbar-hide shrink-0">
          {[{ id: 'content', label: '1. เนื้อหาบทเรียน', icon: '📚' }, { id: 'instructor', label: '2. ผู้พัฒนาหลักสูตร', icon: '👨‍🏫' }, { id: 'exam', label: '3. แบบทดสอบ', icon: '📝' }, { id: 'passed', label: '4. ผู้ผ่านการอบรม', icon: '🏆' }].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setExamState('intro'); }} className={`flex-1 py-3 px-5 text-sm lg:text-base font-bold flex items-center justify-center gap-2 transition whitespace-nowrap ${activeTab === tab.id ? 'border-b-4 border-blue-900 text-blue-900 bg-white' : 'text-slate-500 hover:bg-slate-100'}`}><span>{tab.icon}</span> {tab.label}</button>
          ))}
        </div>

        <div className="p-4 lg:p-6 flex-1 flex flex-col">
          {activeTab === 'content' && (
            <div className="flex flex-col lg:flex-row gap-6 flex-1">
              <div className="w-full lg:w-1/4 xl:w-1/5 lg:border-r pr-4 flex flex-col gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200"><h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><span>📌</span> คำอธิบายหลักสูตร</h3><p className="text-sm text-slate-600 leading-relaxed">{course.intro || 'ไม่มีคำอธิบาย'}</p></div>
                <div className="flex-1 overflow-y-auto">
                  <h3 className="font-bold text-lg border-b pb-2 mb-3 text-slate-800">สารบัญเนื้อหา</h3>
                  <div className="space-y-2">
                    {course.contents.map((mod, idx) => (
                      <button key={mod.id} onClick={() => setActiveLesson(mod)} className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition ${activeLesson?.id === mod.id ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-sm' : 'hover:bg-slate-50 text-slate-600'}`}>
                        <div className="text-xl shrink-0">{mod.type === 'video' ? '▶️' : '📄'}</div><div className="font-medium text-sm leading-snug"><span className="text-slate-400 text-xs block mb-1">บทที่ {idx + 1}</span>{mod.title || 'ไม่มีชื่อบทเรียน'}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-3/4 xl:w-4/5 bg-slate-100 rounded-xl min-h-[500px] lg:h-[calc(100vh-320px)] flex flex-col overflow-hidden relative border border-slate-200 shadow-inner">
                {!activeLesson ? <div className="flex-1 flex items-center justify-center"><p className="text-slate-400 font-bold">👈 เลือกบทเรียนจากเมนูด้านซ้ายเพื่อเริ่มเรียน</p></div> : 
                  activeLesson.type === 'video' ? (
                    <div className="flex-1 flex flex-col"><div className="w-full h-full bg-black flex items-center justify-center relative">{activeLesson.url ? <iframe className="absolute inset-0 w-full h-full" src={getYouTubeEmbedUrl(activeLesson.url)} title={activeLesson.title} frameBorder="0" allowFullScreen></iframe> : <p className="text-slate-500">ยังไม่ได้ระบุลิงก์วิดีโอ</p>}</div><div className="p-4 bg-white border-t shrink-0"><h4 className="font-bold text-lg">{activeLesson.title}</h4></div></div>
                  ) : (
                    <div className="w-full h-full flex flex-col">
                      <div className="bg-slate-800 text-white px-4 py-3 text-sm font-medium z-10 shadow-md flex justify-between items-center shrink-0">
                        <span>📄 โปรแกรมเปิดอ่านเอกสาร PDF/PPT</span>
                        {activeLesson.url && (
                          <a href={activeLesson.url} target="_blank" rel="noreferrer" className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-xs transition border border-slate-600 flex items-center gap-1">เปิดหน้าต่างใหม่ ↗️</a>
                        )}
                      </div>
                      <div className="bg-slate-200 flex-1 overflow-hidden flex justify-center w-full h-full relative">
                        {activeLesson.url ? (
                          <iframe src={activeLesson.url.toLowerCase().endsWith('.pdf') ? activeLesson.url : `https://docs.google.com/viewer?url=${encodeURIComponent(activeLesson.url)}&embedded=true`} title={activeLesson.title} className="w-full h-full border-0" allowFullScreen />
                        ) : (
                          <div className="bg-white w-full h-full shadow-lg border border-slate-300 p-10 flex flex-col items-center justify-center text-center">
                            <div className="text-6xl mb-4 opacity-20">📑</div>
                            <h2 className="text-2xl font-bold text-slate-300 mb-2">{activeLesson.title}</h2>
                            <p className="text-slate-400 mt-4">ยังไม่ได้ระบุลิงก์ไฟล์เอกสาร</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                }
              </div>
            </div>
          )}

          {activeTab === 'instructor' && (
             <div className="space-y-6 w-full">{course.instructors.map((inst, index) => (<div key={inst.id} className="flex flex-col md:flex-row items-start gap-8 bg-slate-50 p-8 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden"><div className="absolute top-0 right-0 bg-blue-100 text-blue-900 px-3 py-1 text-xs font-bold rounded-bl-lg">ท่านที่ {index + 1}</div><div className="w-32 h-32 bg-slate-200 rounded-full overflow-hidden border-4 border-white shadow-md shrink-0"><img src={inst.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200'} alt="Instructor" className="w-full h-full object-cover"/></div><div><h3 className="text-2xl font-bold text-slate-800">{inst.name || 'ไม่มีชื่อผู้สอน'}</h3><p className="text-blue-600 font-bold mb-4">{inst.role || 'ไม่ได้ระบุตำแหน่ง'}</p><p className="text-slate-600 leading-relaxed max-w-full">{inst.description || 'ไม่มีคำอธิบายเพิ่มเติม'}</p></div></div>))}</div>
          )}

          {activeTab === 'exam' && (
            <div className="w-full">
              {course.exam.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100"><p className="text-red-500 font-bold bg-red-50 px-4 py-2 rounded-lg inline-block">❌ แอดมินยังไม่ได้เพิ่มข้อสอบสำหรับหลักสูตรนี้</p></div>
              ) : (
                <>
                  {examState === 'intro' && (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200 shadow-sm"><div className="text-6xl mb-4">📝</div><h3 className="text-2xl font-bold text-slate-800 mb-2">แบบประเมินผลความรู้</h3><p className="text-slate-600 mb-6">ข้อสอบปรนัยจำนวน {course.exam.length} ข้อ <br/><span className="text-blue-600 font-bold">เกณฑ์การผ่าน {course.passingPercentage}%</span> (ต้องถูก {Math.ceil(course.exam.length * (course.passingPercentage/100))} ข้อขึ้นไป)</p><button onClick={handleStartExam} className="bg-blue-900 text-white px-8 py-3 rounded-lg hover:bg-blue-800 transition shadow-md font-bold text-lg inline-flex items-center gap-2">▶️ เริ่มทำแบบทดสอบ</button></div>
                  )}
                  {examState === 'taking' && (
                    <div className="space-y-6 animate-fade-in"><div className="flex justify-between items-center border-b pb-4"><h3 className="text-xl font-bold text-slate-800">กำลังทำแบบทดสอบ...</h3><span className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-sm font-bold">{Object.keys(answers).length} / {course.exam.length} ข้อ</span></div><div className="space-y-6">{course.exam.map((q, idx) => (<div key={q.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"><p className="font-bold text-slate-800 mb-4 text-lg"><span className="text-blue-600 mr-2">{idx + 1}.</span>{q.text}</p><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{q.options.map((opt, oIdx) => (<label key={oIdx} className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${answers[q.id] === oIdx ? 'bg-blue-50 border-blue-400 text-blue-900 font-medium shadow-inner' : 'hover:bg-slate-50 border-slate-200'}`}><input type="radio" name={`q-${q.id}`} value={oIdx} checked={answers[q.id] === oIdx} onChange={() => setAnswers({...answers, [q.id]: oIdx})} className="w-5 h-5 text-blue-600 focus:ring-blue-500" /><span>{opt}</span></label>))}</div></div>))}</div><div className="pt-6 flex justify-end"><button onClick={handleSubmitExam} disabled={Object.keys(answers).length < course.exam.length} className={`px-8 py-3 rounded-lg font-bold text-lg transition shadow-md ${Object.keys(answers).length < course.exam.length ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}>ส่งคำตอบ 📤</button></div></div>
                  )}
                  {examState === 'result' && (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200 shadow-sm animate-fade-in"><div className="text-6xl mb-4">{score.percentage >= course.passingPercentage ? '🏆' : '😅'}</div><h3 className="text-3xl font-bold text-slate-800 mb-2">ผลการทดสอบ</h3><p className="text-xl text-slate-600 mb-6">คุณทำคะแนนได้ <strong className="text-blue-900 text-2xl">{score.correct} / {score.total}</strong> ข้อ <span className="text-sm">({score.percentage}%)</span></p>
                      {score.percentage >= course.passingPercentage ? (
                        <div className="bg-green-100 border border-green-300 p-6 rounded-xl inline-block max-w-md w-full mb-6 shadow-sm"><p className="text-green-800 font-bold text-xl mb-2">🎉 ยินดีด้วย! คุณผ่านเกณฑ์การทดสอบ</p><p className="text-green-700 text-sm mb-4">ระบบได้ทำการอัปเดตสถานะและออกวุฒิบัตรให้คุณแล้ว</p><button onClick={() => setShowCertificate(true)} className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-bold shadow flex items-center justify-center gap-2"><span>📜</span> ดูวุฒิบัตรและบันทึก PDF</button></div>
                      ) : (
                        <div className="bg-red-50 border border-red-200 p-6 rounded-xl inline-block max-w-md w-full mb-6"><p className="text-red-700 font-bold text-lg mb-2">❌ คุณยังไม่ผ่านเกณฑ์ที่กำหนด ({course.passingPercentage}%)</p><p className="text-red-600 text-sm mb-4">กรุณากลับไปทบทวนเนื้อหาและลองทำแบบทดสอบใหม่อีกครั้ง</p><button onClick={() => setExamState('intro')} className="w-full bg-slate-200 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-300 transition font-bold shadow">ทำแบบทดสอบอีกครั้ง 🔄</button></div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'passed' && (<div className="w-full"><h3 className="text-xl font-bold text-slate-800 mb-4 flex justify-between items-center">ทำเนียบผู้ผ่านการอบรม<span className="text-sm font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200">ผ่านแล้ว 42 คน</span></h3><div className="border border-slate-200 rounded-lg overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50 border-b"><tr><th className="p-4 text-slate-600 font-bold">ชื่อ - นามสกุล</th><th className="p-4 text-slate-600 font-bold text-right">วันที่ผ่าน</th></tr></thead><tbody className="divide-y divide-slate-100"><tr className="hover:bg-slate-50"><td className="p-4 flex items-center gap-3"><div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-900">กศ</div> {currentUser.name}</td><td className="p-4 text-right text-slate-500">{getThaiDateString()}</td></tr><tr className="hover:bg-slate-50"><td className="p-4 flex items-center gap-3"><div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-900">วร</div> นางสาว วรรณภา สุขใจ</td><td className="p-4 text-right text-slate-500">25 ต.ค. 66</td></tr></tbody></table></div></div>)}
        </div>
      </div>
    </div>
  );
};

// --- [4] หน้าแอดมิน: ตั้งค่าระบบ ---
const AdminSystemSettingsView = ({ settings, setSettings }: { settings: SystemSettings, setSettings: React.Dispatch<React.SetStateAction<SystemSettings>> }) => {
  const [formData, setFormData] = useState<SystemSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => { setSettings(formData); setIsSaved(true); setTimeout(() => setIsSaved(false), 3000); };

  return (
    <div className="space-y-6 animate-fade-in w-full">
      <div className="flex justify-between items-center border-b pb-4"><h2 className="text-2xl font-bold text-slate-800">⚙️ ตั้งค่าระบบและวุฒิบัตร</h2><button onClick={handleSave} className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-bold shadow-md transition flex items-center gap-2">💾 บันทึกการตั้งค่า</button></div>
      {isSaved && <div className="bg-green-100 text-green-800 p-4 rounded-lg font-bold border border-green-300 shadow-sm">✅ บันทึกข้อมูลสำเร็จ! ข้อมูลนี้จะถูกนำไปใช้ออกใบประกาศนียบัตร</div>}
      <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8 space-y-8 max-w-4xl">
        <div><h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">1. ข้อมูลหน่วยงานหลัก</h3><div className="space-y-4"><div><label className="block text-sm font-bold text-slate-700 mb-1">ชื่อหน่วยงาน / องค์กร (แสดงหัวกระดาษ)</label><input type="text" value={formData.orgName} onChange={e => setFormData({...formData, orgName: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-900" /></div><div><label className="block text-sm font-bold text-slate-700 mb-1">โลโก้หน่วยงาน (URL รูปภาพ)</label><input type="text" value={formData.logoUrl} onChange={e => setFormData({...formData, logoUrl: e.target.value})} className="w-full px-4 py-2 border rounded-lg font-mono text-sm text-blue-600" /></div></div></div>
        <div><h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">2. ข้อมูลผู้ลงนาม (ลายเซ็นบนวุฒิบัตร)</h3><div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-bold text-slate-700 mb-1">ชื่อผู้ลงนาม (เช่น (นาย...))</label><input type="text" value={formData.signatoryName} onChange={e => setFormData({...formData, signatoryName: e.target.value})} className="w-full px-4 py-2 border rounded-lg" /></div><div><label className="block text-sm font-bold text-slate-700 mb-1">ตำแหน่ง</label><input type="text" value={formData.signatoryTitle} onChange={e => setFormData({...formData, signatoryTitle: e.target.value})} className="w-full px-4 py-2 border rounded-lg" /></div></div><div><label className="block text-sm font-bold text-slate-700 mb-1">ภาพลายเซ็น (URL พื้นหลังใส PNG)</label><input type="text" value={formData.signatureUrl} onChange={e => setFormData({...formData, signatureUrl: e.target.value})} className="w-full px-4 py-2 border rounded-lg font-mono text-sm text-blue-600" /></div></div></div>
      </div>
    </div>
  );
};

// --- [5] หน้าแอดมิน: จัดการและแก้ไขหลักสูตร ---
const AdminManagerView = ({ courses, setCourses }: { courses: Course[], setCourses: React.Dispatch<React.SetStateAction<Course[]>> }) => {
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const toggleStatus = (id: number) => setCourses(courses.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));

  const handleCreateNew = () => {
    setEditingCourse({
      id: Date.now(), title: 'หลักสูตรใหม่', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400&h=250', intro: '', isActive: false, passingPercentage: 80,
      instructors: [{ id: Date.now(), name: '', role: '', description: '', image: '' }], contents: [], exam: []
    });
  };

  if (!editingCourse) {
    return (
      <div className="space-y-6 animate-fade-in w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4"><h2 className="text-2xl font-bold text-slate-800">🛠️ จัดการหลักสูตรทั้งหมด</h2><button onClick={handleCreateNew} className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-bold shadow-md transition flex items-center gap-2"><span>➕</span> สร้างหลักสูตรใหม่</button></div>
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto"><table className="w-full text-left whitespace-nowrap"><thead className="bg-slate-50 border-b"><tr><th className="p-4 text-slate-600 font-bold">รูปภาพ</th><th className="p-4 text-slate-600 font-bold w-full">ชื่อหลักสูตร</th><th className="p-4 text-slate-600 font-bold">สถานะ</th><th className="p-4 text-right text-slate-600 font-bold">จัดการ</th></tr></thead><tbody className="divide-y divide-slate-100">{courses.map(course => (<tr key={course.id} className="hover:bg-slate-50 transition"><td className="p-4 w-24"><img src={course.image} className="w-20 h-12 object-cover rounded shadow-sm" alt="thumb"/></td><td className="p-4 font-bold text-slate-700 whitespace-normal min-w-[250px]">{course.title}</td><td className="p-4"><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" checked={course.isActive} onChange={() => toggleStatus(course.id)} /><div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div><span className={`ml-3 text-sm font-bold ${course.isActive ? 'text-green-600' : 'text-slate-400'}`}>{course.isActive ? 'เปิด (Active)' : 'ปิด (Inactive)'}</span></label></td><td className="p-4 text-right"><button onClick={() => setEditingCourse(course)} className="text-blue-700 hover:text-white border border-blue-200 hover:bg-blue-700 font-bold px-4 py-2 rounded transition inline-flex items-center gap-2">✏️ แก้ไขข้อมูล</button></td></tr>))}</tbody></table></div>
      </div>
    );
  }

  return <AdminCourseEditor course={editingCourse} onSave={(updated) => {
    const isExisting = courses.some(c => c.id === updated.id);
    if (isExisting) setCourses(courses.map(c => c.id === updated.id ? updated : c)); else setCourses([...courses, updated]);
    setEditingCourse(null);
  }} onCancel={() => setEditingCourse(null)} />;
};

const AdminCourseEditor = ({ course, onSave, onCancel }: { course: Course, onSave: (c: Course) => void, onCancel: () => void }) => {
  const [formData, setFormData] = useState<Course>({ ...course });
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');

  const handleAddContent = () => setFormData({...formData, contents: [...formData.contents, { id: Date.now(), title: '', type: 'video', url: '' }]});
  const handleRemoveContent = (id: number) => setFormData({...formData, contents: formData.contents.filter(c => c.id !== id)});
  const handleAddInstructor = () => setFormData({...formData, instructors: [...formData.instructors, { id: Date.now(), name: '', role: '', description: '', image: '' }]});
  const handleRemoveInstructor = (id: number) => setFormData({...formData, instructors: formData.instructors.filter(i => i.id !== id)});
  const handleAddQuestionManual = () => setFormData(prev => ({ ...prev, exam: [...prev.exam, { id: Date.now(), text: '', options: ['', '', '', ''], correctAnswer: 0 }] }));

  const handleImportText = () => {
    const lines = importText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const newQuestions: Question[] = [];
    for (let i = 0; i < lines.length; i += 5) {
      if (lines[i]) newQuestions.push({ id: Date.now() + i, text: lines[i], options: [lines[i+1] || '', lines[i+2] || '', lines[i+3] || '', lines[i+4] || ''], correctAnswer: 0 });
    }
    if (newQuestions.length > 0) setFormData(prev => ({ ...prev, exam: [...prev.exam, ...newQuestions] }));
    setImportText(''); setShowImportModal(false);
  };

  const handleAiGenerate = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      const aiQuestions: Question[] = [
        { id: Date.now(), text: 'AI Gen: ข้อใดคือประโยชน์หลักของระบบ E-Learning?', options: ['ประหยัดกระดาษ', 'เรียนได้ทุกที่ทุกเวลา', 'ลดจำนวนครูผู้สอน', 'ไม่ต้องมีการสอบ'], correctAnswer: 1 }
      ];
      setFormData(prev => ({ ...prev, exam: [...prev.exam, ...aiQuestions] }));
      setIsAiGenerating(false);
    }, 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in w-full relative">
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center"><h3 className="font-bold text-lg text-slate-800">📥 นำเข้าข้อสอบจาก Word / Excel</h3><button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-red-500 font-bold">✕ ปิด</button></div>
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm border border-blue-200"><strong>วิธีใช้งาน:</strong> ให้ Copy ข้อความจาก Word หรือ Excel มาวางในกล่องด้านล่าง โดยเรียงลำดับให้ <strong>1 ข้อใช้ 5 บรรทัด</strong> (คำถาม 1 บรรทัด, ตัวเลือก 4 บรรทัด)</div>
              <textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder="วางข้อความข้อสอบที่นี่..." className="w-full h-[300px] p-4 border border-slate-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none resize-none" />
            </div>
            <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowImportModal(false)} className="px-6 py-2 bg-white border border-slate-300 rounded-lg font-bold hover:bg-slate-100">ยกเลิก</button>
              <button onClick={handleImportText} disabled={!importText.trim()} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 shadow-md">✅ นำเข้าข้อมูล</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-300 pb-4 gap-4 mb-6">
        <div><h2 className="text-2xl font-bold text-slate-800">✏️ จัดการข้อมูลหลักสูตร</h2></div>
        <div className="space-x-3 w-full md:w-auto flex">
          <button onClick={onCancel} className="flex-1 md:flex-none px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-bold shadow-sm transition">ยกเลิก</button>
          <button onClick={() => onSave(formData)} className="flex-1 md:flex-none px-6 py-2.5 bg-blue-900 text-white hover:bg-blue-800 rounded-lg font-bold shadow-md transition">💾 บันทึกทั้งหมด</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><span className="bg-blue-100 text-blue-900 w-8 h-8 rounded-full flex items-center justify-center">1</span> ข้อมูลทั่วไป (Introduction)</h3>
            <div className="space-y-4">
              <div><label className="block text-sm font-bold mb-1">ชื่อหลักสูตร</label><input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-900" /></div>
              <div><label className="block text-sm font-bold mb-1">หน้าปกหลักสูตร (URL รูปภาพ)</label><input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-900 text-sm font-mono text-blue-600" /></div>
              <div><label className="block text-sm font-bold mb-1">คำอธิบาย / บทนำ</label><textarea rows={3} value={formData.intro} onChange={e => setFormData({...formData, intro: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-900" /></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold flex items-center gap-2"><span className="bg-blue-100 text-blue-900 w-8 h-8 rounded-full flex items-center justify-center">2</span> ผู้พัฒนาหลักสูตร</h3><span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{formData.instructors.length} ท่าน</span></div>
            <div className="space-y-6">
              {formData.instructors.map((inst, index) => (
                <div key={inst.id} className="p-5 border border-slate-200 rounded-lg bg-slate-50 relative group">
                  {formData.instructors.length > 1 && <button onClick={() => handleRemoveInstructor(inst.id)} className="absolute -top-3 -right-3 bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 font-bold transition shadow-sm" title="ลบผู้สอนท่านนี้">✕</button>}
                  <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wide">ผู้พัฒนาคนที่ {index + 1}</p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className="block text-sm font-bold mb-1">ชื่อ - นามสกุล</label><input type="text" value={inst.name} onChange={e => { const newInsts = [...formData.instructors]; newInsts[index] = { ...newInsts[index], name: e.target.value }; setFormData({...formData, instructors: newInsts}); }} className="w-full px-4 py-2 border border-slate-300 rounded-lg" /></div>
                      <div><label className="block text-sm font-bold mb-1">ตำแหน่ง / หน่วยงาน</label><input type="text" value={inst.role} onChange={e => { const newInsts = [...formData.instructors]; newInsts[index] = { ...newInsts[index], role: e.target.value }; setFormData({...formData, instructors: newInsts}); }} className="w-full px-4 py-2 border border-slate-300 rounded-lg" /></div>
                    </div>
                    <div><label className="block text-sm font-bold mb-1">รูปโปรไฟล์ (URL)</label><input type="text" value={inst.image} onChange={e => { const newInsts = [...formData.instructors]; newInsts[index] = { ...newInsts[index], image: e.target.value }; setFormData({...formData, instructors: newInsts}); }} className="w-full px-4 py-2 border border-slate-300 rounded-lg font-mono text-sm" /></div>
                    <div><label className="block text-sm font-bold mb-1">ประวัติโดยย่อ</label><textarea rows={2} value={inst.description} onChange={e => { const newInsts = [...formData.instructors]; newInsts[index] = { ...newInsts[index], description: e.target.value }; setFormData({...formData, instructors: newInsts}); }} className="w-full px-4 py-2 border border-slate-300 rounded-lg" /></div>
                  </div>
                </div>
              ))}
              <button onClick={handleAddInstructor} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-500 hover:text-blue-600 font-bold flex items-center justify-center gap-2"><span>➕</span> เพิ่มผู้พัฒนาหลักสูตรอีกท่าน</button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><span className="bg-blue-100 text-blue-900 w-8 h-8 rounded-full flex items-center justify-center">3</span> เนื้อหาบทเรียน (Contents)</h3>
            <div className="space-y-4">
              {formData.contents.map((mod, index) => (
                <div key={mod.id} className="p-4 border rounded-lg bg-slate-50 relative group">
                  <button onClick={() => handleRemoveContent(mod.id)} className="absolute -top-3 -right-3 bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 font-bold shadow-sm">✕</button>
                  <p className="text-xs font-bold text-slate-400 mb-2">บทที่ {index + 1}</p>
                  <div className="flex flex-col sm:flex-row gap-3 mb-3">
                    <select value={mod.type} onChange={e => { const newContents = [...formData.contents]; newContents[index] = { ...newContents[index], type: e.target.value as 'video'|'pdf' }; setFormData({...formData, contents: newContents}); }} className="px-3 py-2 border rounded-lg bg-white font-bold"><option value="video">🎥 Video (YouTube)</option><option value="pdf">📄 เอกสาร PDF / PPT</option></select>
                    <input type="text" value={mod.title} placeholder="ชื่อหัวข้อบทเรียน..." onChange={e => { const newContents = [...formData.contents]; newContents[index] = { ...newContents[index], title: e.target.value }; setFormData({...formData, contents: newContents}); }} className="flex-1 px-4 py-2 border rounded-lg" />
                  </div>
                  <div><input type="text" value={mod.url} onChange={e => { const newContents = [...formData.contents]; newContents[index] = { ...newContents[index], url: e.target.value }; setFormData({...formData, contents: newContents}); }} placeholder={mod.type === 'video' ? "ลิงก์ YouTube..." : "ลิงก์ไฟล์ PDF..."} className="w-full px-4 py-2 border rounded-lg font-mono text-sm text-blue-600" /></div>
                </div>
              ))}
              <button onClick={handleAddContent} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-500 hover:text-blue-600 font-bold flex items-center justify-center gap-2"><span>➕</span> เพิ่มบทเรียนใหม่</button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-auto">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4 border-b pb-4 shrink-0">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2"><span className="bg-blue-100 text-blue-900 w-8 h-8 rounded-full flex items-center justify-center">4</span> แบบประเมิน (Exam)</h3>
              <div className="mt-2 ml-10 flex items-center gap-2 text-sm text-slate-600 font-bold">เกณฑ์ผ่าน: <input type="number" value={formData.passingPercentage} onChange={e => setFormData({...formData, passingPercentage: Number(e.target.value)})} className="w-16 px-2 py-1 border rounded text-center text-blue-900" min="1" max="100"/> %</div>
            </div>
            <div className="flex flex-wrap gap-2 w-full xl:w-auto">
              <button onClick={handleAddQuestionManual} className="flex-1 xl:flex-none px-4 py-2.5 rounded-lg font-bold text-sm bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition shadow-sm">➕ เพิ่มข้อสอบเอง</button>
              <button onClick={() => setShowImportModal(true)} className="flex-1 xl:flex-none px-4 py-2.5 rounded-lg font-bold text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition shadow-sm">📥 นำเข้าจาก Word/Excel</button>
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            {formData.exam.map((q, qIndex) => (
              <div key={q.id} className="p-5 border border-slate-300 rounded-xl bg-white relative shadow-sm">
                <button onClick={() => setFormData({...formData, exam: formData.exam.filter(x => x.id !== q.id)})} className="absolute top-4 right-4 text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-full w-8 h-8 flex items-center justify-center transition" title="ลบข้อนี้">🗑️</button>
                <div className="mb-4 pr-10">
                  <label className="font-bold text-slate-800 flex items-center gap-2 mb-2"><span className="text-blue-600">ข้อ {qIndex + 1}.</span> คำถาม</label>
                  <input type="text" value={q.text} onChange={(e) => { const newExam = [...formData.exam]; newExam[qIndex].text = e.target.value; setFormData({...formData, exam: newExam}); }} placeholder="พิมพ์คำถามที่นี่..." className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className={`p-3 border rounded-lg flex items-center gap-3 transition ${q.correctAnswer === oIndex ? 'bg-green-50 border-green-400 shadow-inner' : 'bg-slate-50 border-slate-200'}`}>
                      <input type="radio" name={`correct-${q.id}`} checked={q.correctAnswer === oIndex} onChange={() => { const newExam = [...formData.exam]; newExam[qIndex].correctAnswer = oIndex; setFormData({...formData, exam: newExam}); }} className="w-5 h-5 text-green-600 cursor-pointer shrink-0" title="เลือกเป็นข้อที่ถูก" /> 
                      <input type="text" value={opt} onChange={(e) => { const newExam = [...formData.exam]; newExam[qIndex].options[oIndex] = e.target.value; setFormData({...formData, exam: newExam}); }} placeholder={`ตัวเลือกที่ ${oIndex + 1}`} className="flex-1 px-3 py-1.5 border border-slate-300 rounded bg-white text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {formData.exam.length === 0 && <div className="text-center py-16 border-2 border-dashed rounded-xl bg-slate-50 flex flex-col items-center justify-center"><h4 className="font-bold text-slate-500">ยังไม่มีแบบทดสอบในระบบ กดปุ่มด้านบนเพื่อเพิ่ม</h4></div>}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-300">
        <button onClick={onCancel} className="px-8 py-3 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-bold shadow-sm transition text-lg">ยกเลิก</button>
        <button onClick={() => onSave(formData)} className="px-8 py-3 bg-blue-900 text-white hover:bg-blue-800 rounded-lg font-bold shadow-md transition text-lg">💾 บันทึกการเปลี่ยนแปลงทั้งหมด</button>
      </div>
    </div>
  );
};

// --- [6] โครงสร้างหลัก (Main Layout) ---
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentMenu, setCurrentMenu] = useState('home'); 
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [settings, setSettings] = useState<SystemSettings>(initialSettings);

  if (!isLoggedIn) return <LoginView onLogin={() => setIsLoggedIn(true)} />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* 🔴 Top Navigation Bar */}
      <header className="bg-blue-900 text-white shadow-md sticky top-0 z-40 w-full">
        <div className="px-4 md:px-8 py-3 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
           <div className="flex items-center justify-between w-full md:w-auto">
             <div className="flex items-center gap-3">
               <h1 className="text-2xl font-bold tracking-wide">E-Learning</h1>
               <div className="hidden md:block h-6 w-px bg-blue-700"></div>
               <p className="text-blue-200 text-sm hidden md:block max-w-[300px] truncate">{settings.orgName}</p>
             </div>
             <button onClick={() => setIsLoggedIn(false)} className="md:hidden text-red-300 hover:text-white transition">🚪 ออกจากระบบ</button>
           </div>

           {/* เมนูหลัก */}
           <nav className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide text-sm md:text-base">
             <button onClick={() => setCurrentMenu('home')} className={`whitespace-nowrap px-4 py-2 rounded-lg transition flex items-center gap-2 ${currentMenu==='home' || currentMenu==='detail' ? 'bg-blue-800 font-bold text-white shadow-inner' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`}>🏠 หน้าแรก</button>
             
             <div className="h-6 w-px bg-blue-800 hidden sm:block mx-2"></div>
             
             <button onClick={() => setCurrentMenu('admin')} className={`whitespace-nowrap px-4 py-2 rounded-lg transition flex items-center gap-2 ${currentMenu==='admin' ? 'bg-blue-800 font-bold text-white shadow-inner' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`}>🛠️ จัดการหลักสูตร</button>
             <button onClick={() => setCurrentMenu('settings')} className={`whitespace-nowrap px-4 py-2 rounded-lg transition flex items-center gap-2 ${currentMenu==='settings' ? 'bg-blue-800 font-bold text-white shadow-inner' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`}>⚙️ ตั้งค่าระบบ</button>
           </nav>

           <div className="hidden md:flex items-center gap-3 shrink-0">
             <div className="text-right">
               <p className="text-sm font-bold">{currentUser.name}</p>
               <p className="text-xs text-blue-300">{currentUser.role}</p>
             </div>
             <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-900 font-bold shadow-inner">U</div>
             <button onClick={() => setIsLoggedIn(false)} className="ml-2 text-red-300 hover:text-red-400 transition bg-blue-800 hover:bg-blue-700 p-2 rounded-lg" title="ออกจากระบบ">🚪</button>
           </div>
        </div>
      </header>

      {/* 🔴 Main Content Area */}
      <main className="flex-1 w-full p-4 md:p-8 overflow-y-auto">
        <div className="w-full">
          {currentMenu === 'home' && <CourseCatalogView courses={courses} settings={settings} onViewCourse={(c) => { setSelectedCourse(c); setCurrentMenu('detail'); }} />}
          {currentMenu === 'detail' && selectedCourse && <CourseDetailView course={selectedCourse} settings={settings} onBack={() => setCurrentMenu('home')} />}
          {currentMenu === 'admin' && <AdminManagerView courses={courses} setCourses={setCourses} />}
          {currentMenu === 'settings' && <AdminSystemSettingsView settings={settings} setSettings={setSettings} />}
        </div>
      </main>

    </div>
  );
}