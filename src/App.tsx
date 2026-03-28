import { useState, useEffect } from 'react';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase'; 
import liff from '@line/liff'; 

// ✅ ใส่ LIFF ID ของคุณเรียบร้อยแล้ว
const LIFF_ID = "2009628432-xW2BZzYX"; 

// --- Types ---
type ContentModule = { id: number; title: string; type: 'video' | 'pdf'; url: string; };
type Question = { id: number; text: string; options: string[]; correctAnswer: number; };
type Instructor = { id: number; name: string; role: string; description: string; image: string; };
type Course = { id: number; title: string; image: string; intro: string; isActive: boolean; passingPercentage: number; instructors: Instructor[]; contents: ContentModule[]; exam: Question[]; };
type SystemSettings = { orgName: string; signatoryName: string; signatoryTitle: string; logoUrl: string; signatureUrl: string; };
type CertificateRecord = { id: number; userId: number; userName: string; courseId: number; courseTitle: string; datePassed: string; };
type User = { 
  id: number; username: string; password: string; name: string; role: 'admin' | 'user'; 
  registerSource?: 'web' | 'admin' | 'line'; lineUserId?: string; 
};

const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return '';
  let videoId = '';
  if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
  else if (url.includes('youtube.com/watch')) videoId = new URL(url).searchParams.get('v') || '';
  else if (url.includes('youtube.com/embed/')) return url; 
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};

const getThaiDateString = () => {
  const d = new Date();
  const months = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  return `${d.getDate()} เดือน${months[d.getMonth()]} พุทธศักราช ${d.getFullYear() + 543}`;
};

const initialCourses: Course[] = [{ id: 1, title: 'ระเบียบงานสารบรรณ พ.ศ. 2566', image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=400&h=250', intro: 'หลักสูตรพื้นฐานสำหรับบุคลากรทางการศึกษา...', isActive: true, passingPercentage: 80, instructors: [{ id: 1, name: 'อ. สมชาย รักเรียน', role: 'ผู้เชี่ยวชาญ สพป.ชัยภูมิ เขต 2', description: 'ผู้เชี่ยวชาญด้านการพัฒนาบุคลากร', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200' }], contents: [{ id: 1, title: 'บทนำงานสารบรรณ (วิดีโอ)', type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }], exam: [{ id: 1, text: 'หนังสือราชการมีกี่ชนิด?', options: ['4 ชนิด', '5 ชนิด', '6 ชนิด', '7 ชนิด'], correctAnswer: 2 }, { id: 2, text: 'ข้อใดคือส่วนประกอบที่สำคัญที่สุดของหนังสือราชการ?', options: ['ตราครุฑ', 'วันที่', 'ลายมือชื่อ', 'เนื้อหาใจความ'], correctAnswer: 3 }] }];
const initialSettings: SystemSettings = { orgName: 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษาชัยภูมิ เขต 2', signatoryName: '(นายสมชาย ตัวอย่าง)', signatoryTitle: 'ผู้อำนวยการสำนักงานเขตพื้นที่การศึกษาประถมศึกษาชัยภูมิ เขต 2', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/ตรากระทรวงศึกษาธิการ.svg/400px-ตรากระทรวงศึกษาธิการ.svg.png', signatureUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Signature_of_John_Hancock.svg/300px-Signature_of_John_Hancock.svg.png' };
const mockUsersDb: User[] = [ { id: 1, username: 'admin', password: '123', name: 'ผู้ดูแลระบบสูงสุด', role: 'admin', registerSource: 'admin' } ];

// --- [1] หน้า Login & Register ---
const LoginRegisterView = ({ onLogin, usersDb, onRegister, onUpdateUser }: { onLogin: (u: User) => void, usersDb: User[], onRegister: (u: User) => void, onUpdateUser: (u: User) => void }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', name: '' });
  const [error, setError] = useState('');
  
  const [isLiffLoading, setIsLiffLoading] = useState(true);
  const [lineProfile, setLineProfile] = useState<{ userId: string; displayName: string; pictureUrl?: string } | null>(null);

  useEffect(() => {
    const initLiff = async () => {
      try {
        // ✅ เอาการเปรียบเทียบที่ทำให้ Error ออก
        if (!LIFF_ID) {
          setIsLiffLoading(false);
          return; 
        }

        await liff.init({ liffId: LIFF_ID });
        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile();
          setLineProfile(profile);

          const existingUser = usersDb.find(u => u.lineUserId === profile.userId);
          if (existingUser) {
            onLogin(existingUser); 
          } else {
            setFormData(prev => ({ ...prev, name: profile.displayName }));
            setIsLoginMode(false); 
          }
        }
      } catch (err) {
        console.error('LIFF Init Error:', err);
      } finally {
        setIsLiffLoading(false);
      }
    };
    initLiff();
  }, [usersDb, onLogin]);

  const handleLineLogin = () => {
    if (!liff.isLoggedIn()) {
      liff.login();
    }
  };

  const handleSubmit = () => {
    setError('');
    if (isLoginMode) {
      const user = usersDb.find(u => u.username === formData.username && u.password === formData.password);
      if (user) {
        if (lineProfile && !user.lineUserId) {
          const updatedUser = { ...user, lineUserId: lineProfile.userId };
          onUpdateUser(updatedUser);
          onLogin(updatedUser);
        } else {
          onLogin(user);
        }
      } else {
        setError('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
      }
    } else {
      if (!formData.username || !formData.password || !formData.name) return setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      if (usersDb.find(u => u.username === formData.username)) return setError('ชื่อผู้ใช้งานนี้มีคนใช้แล้ว');
      
      const newUser: User = { 
        id: Date.now(), 
        username: formData.username, 
        password: formData.password, 
        name: formData.name, 
        role: 'user', 
        registerSource: lineProfile ? 'line' : 'web', 
        lineUserId: lineProfile ? lineProfile.userId : undefined 
      };
      onRegister(newUser);
      onLogin(newUser);
    }
  };

  if (isLiffLoading) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50"><div className="text-4xl animate-bounce mb-4 text-[#06C755]">💬</div><p className="text-slate-600 font-bold">กำลังเชื่อมต่อระบบ LINE...</p></div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">🎓</div>
          <h1 className="text-2xl font-bold text-slate-800">ระบบ E-Learning</h1>
          <p className="text-slate-500 mt-1">สพป.ชัยภูมิ เขต 2</p>
        </div>

        {lineProfile && (
          <div className="bg-[#f0fcf4] border border-[#a2ecc2] p-4 rounded-xl mb-6 flex items-center gap-4">
            {lineProfile.pictureUrl ? (
              <img src={lineProfile.pictureUrl} alt="LINE Avatar" className="w-12 h-12 rounded-full shadow-sm" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#06C755] flex items-center justify-center text-white font-bold text-xl">💬</div>
            )}
            <div>
              <p className="text-xs text-green-700 font-bold uppercase">กำลังทำรายการผ่าน LINE</p>
              <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]">{lineProfile.displayName}</p>
            </div>
          </div>
        )}

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold mb-4 border border-red-200 text-center">{error}</div>}
        
        <div className="space-y-4">
          {!isLoginMode && (<div><label className="block text-sm font-bold text-slate-700 mb-1">ชื่อ - นามสกุล (สำหรับออกวุฒิบัตร)</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-900" placeholder="ระบุชื่อ-นามสกุลจริง..." /></div>)}
          <div><label className="block text-sm font-bold text-slate-700 mb-1">ชื่อผู้ใช้งาน (Username ตั้งขึ้นเอง)</label><input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-900" placeholder="Username" /></div>
          <div><label className="block text-sm font-bold text-slate-700 mb-1">รหัสผ่าน (Password ตั้งขึ้นเอง)</label><input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-900" placeholder="Password" /></div>
          <button onClick={handleSubmit} className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800 transition font-bold shadow-md mt-4">
            {isLoginMode ? 'เข้าสู่ระบบ' : (lineProfile ? 'ผูกบัญชี LINE และสมัครสมาชิก' : 'สมัครสมาชิกใหม่')}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500 border-t pt-4">
          {isLoginMode ? 'ยังไม่มีบัญชีผู้ใช้งาน? ' : 'มีบัญชีอยู่แล้ว? '}
          <button onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }} className="text-blue-600 font-bold hover:underline">{isLoginMode ? 'สมัครสมาชิก' : 'เข้าสู่ระบบเลย'}</button>
        </div>

        {/* ✅ เอาการเปรียบเทียบที่ทำให้ Error ออก */}
        {!lineProfile && LIFF_ID && (
          <button onClick={handleLineLogin} className="w-full mt-4 p-3 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-lg text-center font-bold transition shadow-md flex items-center justify-center gap-2">
            💬 เข้าสู่ระบบด้วย LINE
          </button>
        )}
      </div>
    </div>
  );
};

// --- ใบประกาศนียบัตร ---
const CertificateModal = ({ studentName, courseTitle, datePassed, settings, onClose }: { studentName: string, courseTitle: string, datePassed: string, settings: SystemSettings, onClose: () => void }) => {
  const printCertificate = () => { window.print(); };
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 print:p-0 print:bg-white overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden print:shadow-none print:w-[297mm] print:h-[210mm] relative">
        <div className="bg-slate-100 p-4 flex justify-between items-center border-b print:hidden sticky top-0 z-50"><h3 className="font-bold text-slate-700">📜 ตัวอย่างใบวุฒิบัตร</h3><div className="flex gap-3"><button onClick={printCertificate} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow-sm">🖨️ พิมพ์ / บันทึก PDF</button><button onClick={onClose} className="bg-slate-300 hover:bg-slate-400 text-slate-800 px-6 py-2 rounded-lg font-bold">ปิดหน้าต่าง</button></div></div>
        <div className="p-8 print:p-0 flex justify-center bg-gray-50 print:bg-white min-h-[600px]">
          <div className="w-full aspect-[1.414/1] bg-white border-[16px] border-blue-900 p-2 relative shadow-inner flex flex-col items-center justify-center text-center">
            <div className="absolute inset-2 border-4 border-blue-900 opacity-80 pointer-events-none"></div>
            <img src={settings.logoUrl} alt="Logo" className="h-24 md:h-28 lg:h-32 mb-4 object-contain" />
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-blue-900 mb-2">{settings.orgName}</h1>
            <p className="text-lg md:text-xl font-medium text-slate-700 mb-8">ขอมอบวุฒิบัตรฉบับนี้ให้ไว้เพื่อแสดงว่า</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-8">{studentName}</h2>
            <p className="text-base md:text-lg font-medium text-slate-700 mb-1">ได้ผ่านการเรียนรู้ผ่านสื่ออิเล็กทรอนิกส์</p>
            <p className="text-lg md:text-xl font-bold text-blue-900 mb-1">หลักสูตร {courseTitle}</p>
            <p className="text-base md:text-lg font-medium text-slate-700 mb-6">ผลการประเมิน <span className="font-bold text-green-700">"ผ่าน"</span></p>
            <p className="text-sm md:text-base font-medium text-slate-600 mb-1">ขอให้มีความเจริญ สุขสวัสดิ์ และประสบความสำเร็จในหน้าที่การงานสืบไป</p>
            <p className="text-sm md:text-base font-medium text-slate-600 mb-12">ให้ไว้เมื่อวันที่ {datePassed}</p>
            <div className="flex flex-col items-center mt-auto mb-4">
              <img src={settings.signatureUrl} alt="Signature" className="h-12 md:h-16 mb-2 object-contain" />
              <p className="font-bold text-slate-800 text-sm md:text-base">{settings.signatoryName}</p>
              <p className="text-xs md:text-sm text-slate-600">{settings.signatoryTitle}</p>
            </div>
            <div className="absolute bottom-6 right-8 flex flex-col items-center"><div className="w-16 h-16 bg-slate-200 border border-slate-300 flex items-center justify-center text-[10px] text-slate-400 mb-1 rounded-sm">QR<br/>Code</div><p className="text-[10px] text-slate-500">เลขที่วุฒิบัตร {(Math.random() * 10000).toFixed(0).padStart(5, '0')}/{(new Date().getFullYear() + 543)}</p></div>
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
              <div className="p-5 flex-1 flex flex-col justify-between"><h3 className="font-bold text-slate-800 line-clamp-2 leading-tight">{course.title}</h3><div className="mt-4 flex items-center justify-between"><span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200">เปิดเรียน</span><span className="text-xs text-slate-500 font-bold flex items-center gap-1">👨‍🏫 {course.instructors.length} ท่าน</span></div></div>
            </div>
          ))}
          {activeCourses.length === 0 && <p className="text-slate-500 col-span-full text-center py-10 bg-white rounded-xl border border-dashed">ยังไม่มีหลักสูตรที่เปิดสอนในขณะนี้</p>}
        </div>
      </div>
    </div>
  );
};

// --- [3] หน้ารายละเอียดการเรียน ---
const CourseDetailView = ({ course, settings, currentUser, certRecords, onSaveCert, onBack }: { course: Course, settings: SystemSettings, currentUser: User, certRecords: CertificateRecord[], onSaveCert: (c: CertificateRecord) => void, onBack: () => void }) => {
  const [activeTab, setActiveTab] = useState<string>('content'); 
  const [activeLesson, setActiveLesson] = useState<ContentModule | null>(course.contents[0] || null);
  const [examState, setExamState] = useState<'intro' | 'taking' | 'result'>('intro');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState({ correct: 0, total: 0, percentage: 0 });
  const [showCertificate, setShowCertificate] = useState(false);

  const hasPassed = certRecords.some(r => r.userId === currentUser.id && r.courseId === course.id);
  const passRecord = certRecords.find(r => r.userId === currentUser.id && r.courseId === course.id);
  const passedUsersForThisCourse = certRecords.filter(r => r.courseId === course.id);

  const handleStartExam = () => { setAnswers({}); setExamState('taking'); };
  const handleSubmitExam = () => {
    let correctCount = 0;
    course.exam.forEach(q => { if (answers[q.id] === q.correctAnswer) correctCount++; });
    const percent = Math.round((correctCount / course.exam.length) * 100);
    setScore({ correct: correctCount, total: course.exam.length, percentage: percent });
    setExamState('result');
    if (percent >= course.passingPercentage && !hasPassed) {
      onSaveCert({ id: Date.now(), userId: currentUser.id, userName: currentUser.name, courseId: course.id, courseTitle: course.title, datePassed: getThaiDateString() }); 
    }
  };

  return (
    <div className="space-y-6 animate-fade-in w-full relative">
      <button onClick={onBack} className="text-blue-600 hover:text-blue-900 flex items-center gap-2 font-bold bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg inline-flex transition"><span>⬅️</span> กลับไปหน้าหลักสูตร</button>
      {showCertificate && <CertificateModal studentName={currentUser.name} courseTitle={course.title} datePassed={passRecord?.datePassed || getThaiDateString()} settings={settings} onClose={() => setShowCertificate(false)} />}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full flex flex-col">
        <div className="h-32 lg:h-40 bg-blue-900 text-white p-6 lg:p-8 flex flex-col justify-end relative overflow-hidden shrink-0"><img src={course.image} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="bg" /><div className="absolute inset-0 bg-gradient-to-t from-blue-900 to-transparent opacity-80"></div><h2 className="text-2xl lg:text-3xl font-bold relative z-10 leading-tight">{course.title}</h2></div>
        <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto scrollbar-hide shrink-0">{[{ id: 'content', label: '1. เนื้อหาบทเรียน', icon: '📚' }, { id: 'instructor', label: '2. ผู้พัฒนาหลักสูตร', icon: '👨‍🏫' }, { id: 'exam', label: '3. แบบทดสอบ', icon: '📝' }, { id: 'passed', label: '4. ผู้ผ่านการอบรม', icon: '🏆' }].map(tab => (<button key={tab.id} onClick={() => { setActiveTab(tab.id); setExamState('intro'); }} className={`flex-1 py-3 px-5 text-sm lg:text-base font-bold flex items-center justify-center gap-2 transition whitespace-nowrap ${activeTab === tab.id ? 'border-b-4 border-blue-900 text-blue-900 bg-white' : 'text-slate-500 hover:bg-slate-100'}`}><span>{tab.icon}</span> {tab.label}</button>))}</div>
        <div className="p-4 lg:p-6 flex-1 flex flex-col">
          {activeTab === 'content' && (
            <div className="flex flex-col lg:flex-row gap-6 flex-1">
              <div className="w-full lg:w-1/4 xl:w-1/5 lg:border-r pr-4 flex flex-col gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200"><h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><span>📌</span> คำอธิบายหลักสูตร</h3><p className="text-sm text-slate-600 leading-relaxed">{course.intro || 'ไม่มีคำอธิบาย'}</p></div>
                <div className="flex-1 overflow-y-auto"><h3 className="font-bold text-lg border-b pb-2 mb-3 text-slate-800">สารบัญเนื้อหา</h3><div className="space-y-2">{course.contents.map((mod, idx) => (<button key={mod.id} onClick={() => setActiveLesson(mod)} className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition ${activeLesson?.id === mod.id ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-sm' : 'hover:bg-slate-50 text-slate-600'}`}><div className="text-xl shrink-0">{mod.type === 'video' ? '▶️' : '📄'}</div><div className="font-medium text-sm leading-snug"><span className="text-slate-400 text-xs block mb-1">บทที่ {idx + 1}</span>{mod.title || 'ไม่มีชื่อบทเรียน'}</div></button>))}</div></div>
              </div>
              <div className="w-full lg:w-3/4 xl:w-4/5 bg-slate-100 rounded-xl min-h-[500px] lg:h-[calc(100vh-320px)] flex flex-col overflow-hidden relative border border-slate-200 shadow-inner">
                {!activeLesson ? <div className="flex-1 flex items-center justify-center"><p className="text-slate-400 font-bold">👈 เลือกบทเรียนจากเมนูด้านซ้ายเพื่อเริ่มเรียน</p></div> : 
                  activeLesson.type === 'video' ? (
                    <div className="flex-1 flex flex-col"><div className="w-full h-full bg-black flex items-center justify-center relative">{activeLesson.url ? <iframe className="absolute inset-0 w-full h-full" src={getYouTubeEmbedUrl(activeLesson.url)} title={activeLesson.title} frameBorder="0" allowFullScreen></iframe> : <p className="text-slate-500">ยังไม่ได้ระบุลิงก์วิดีโอ</p>}</div><div className="p-4 bg-white border-t shrink-0"><h4 className="font-bold text-lg">{activeLesson.title}</h4></div></div>
                  ) : (
                    <div className="w-full h-full flex flex-col"><div className="bg-slate-800 text-white px-4 py-3 text-sm font-medium z-10 shadow-md flex justify-between items-center shrink-0"><span>📄 โปรแกรมเปิดอ่านเอกสาร PDF/PPT</span>{activeLesson.url && (<a href={activeLesson.url} target="_blank" rel="noreferrer" className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-xs transition border border-slate-600 flex items-center gap-1">เปิดหน้าต่างใหม่ ↗️</a>)}</div><div className="bg-slate-200 flex-1 overflow-hidden flex justify-center w-full h-full relative">{activeLesson.url ? (<iframe src={activeLesson.url.toLowerCase().endsWith('.pdf') ? activeLesson.url : `https://docs.google.com/viewer?url=${encodeURIComponent(activeLesson.url)}&embedded=true`} title={activeLesson.title} className="w-full h-full border-0" allowFullScreen />) : (<div className="bg-white w-full h-full shadow-lg border border-slate-300 p-10 flex flex-col items-center justify-center text-center"><div className="text-6xl mb-4 opacity-20">📑</div><h2 className="text-2xl font-bold text-slate-300 mb-2">{activeLesson.title}</h2><p className="text-slate-400 mt-4">ยังไม่ได้ระบุลิงก์ไฟล์เอกสาร</p></div>)}</div></div>
                  )
                }
              </div>
            </div>
          )}
          {activeTab === 'instructor' && ( <div className="space-y-6 w-full">{course.instructors.map((inst, index) => (<div key={inst.id} className="flex flex-col md:flex-row items-start gap-8 bg-slate-50 p-8 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden"><div className="absolute top-0 right-0 bg-blue-100 text-blue-900 px-3 py-1 text-xs font-bold rounded-bl-lg">ท่านที่ {index + 1}</div><div className="w-32 h-32 bg-slate-200 rounded-full overflow-hidden border-4 border-white shadow-md shrink-0"><img src={inst.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200'} alt="Instructor" className="w-full h-full object-cover"/></div><div><h3 className="text-2xl font-bold text-slate-800">{inst.name || 'ไม่มีชื่อผู้สอน'}</h3><p className="text-blue-600 font-bold mb-4">{inst.role || 'ไม่ได้ระบุตำแหน่ง'}</p><p className="text-slate-600 leading-relaxed max-w-full">{inst.description || 'ไม่มีคำอธิบายเพิ่มเติม'}</p></div></div>))}</div>)}
          {activeTab === 'exam' && (
            <div className="w-full max-w-4xl mx-auto">
              {course.exam.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100"><p className="text-red-500 font-bold bg-red-50 px-4 py-2 rounded-lg inline-block">❌ แอดมินยังไม่ได้เพิ่มข้อสอบสำหรับหลักสูตรนี้</p></div>
              ) : (
                <>
                  {examState === 'intro' && (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200 shadow-sm"><div className="text-6xl mb-4">📝</div><h3 className="text-2xl font-bold text-slate-800 mb-2">แบบประเมินผลความรู้</h3><p className="text-slate-600 mb-6">ข้อสอบปรนัยจำนวน {course.exam.length} ข้อ <br/><span className="text-blue-600 font-bold">เกณฑ์การผ่าน {course.passingPercentage}%</span> (ต้องถูก {Math.ceil(course.exam.length * (course.passingPercentage/100))} ข้อขึ้นไป)</p>
                      {hasPassed ? ( <div className="bg-green-100 p-4 rounded-lg inline-block text-green-800 border border-green-300"><p className="font-bold mb-2">🎉 คุณได้สอบผ่านหลักสูตรนี้ไปแล้ว เมื่อ {passRecord?.datePassed}</p><button onClick={() => setShowCertificate(true)} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 shadow flex items-center gap-2 mx-auto"><span>📜</span> ดูวุฒิบัตรของคุณ</button></div> ) : ( <button onClick={handleStartExam} className="bg-blue-900 text-white px-8 py-3 rounded-lg hover:bg-blue-800 transition shadow-md font-bold text-lg inline-flex items-center gap-2">▶️ เริ่มทำแบบทดสอบ</button> )}
                    </div>
                  )}
                  {examState === 'taking' && (
                    <div className="space-y-6 animate-fade-in"><div className="flex justify-between items-center border-b pb-4"><h3 className="text-xl font-bold text-slate-800">กำลังทำแบบทดสอบ...</h3><span className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-sm font-bold">{Object.keys(answers).length} / {course.exam.length} ข้อ</span></div><div className="space-y-6">{course.exam.map((q, idx) => (<div key={q.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"><p className="font-bold text-slate-800 mb-4 text-lg"><span className="text-blue-600 mr-2">{idx + 1}.</span>{q.text}</p><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{q.options.map((opt, oIdx) => (<label key={oIdx} className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${answers[q.id] === oIdx ? 'bg-blue-50 border-blue-400 text-blue-900 font-medium shadow-inner' : 'hover:bg-slate-50 border-slate-200'}`}><input type="radio" name={`q-${q.id}`} value={oIdx} checked={answers[q.id] === oIdx} onChange={() => setAnswers({...answers, [q.id]: oIdx})} className="w-5 h-5 text-blue-600 focus:ring-blue-500" /><span>{opt}</span></label>))}</div></div>))}</div><div className="pt-6 flex justify-end"><button onClick={handleSubmitExam} disabled={Object.keys(answers).length < course.exam.length} className={`px-8 py-3 rounded-lg font-bold text-lg transition shadow-md ${Object.keys(answers).length < course.exam.length ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}>ส่งคำตอบ 📤</button></div></div>
                  )}
                  {examState === 'result' && (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200 shadow-sm animate-fade-in"><div className="text-6xl mb-4">{score.percentage >= course.passingPercentage ? '🏆' : '😅'}</div><h3 className="text-3xl font-bold text-slate-800 mb-2">ผลการทดสอบ</h3><p className="text-xl text-slate-600 mb-6">คุณทำคะแนนได้ <strong className="text-blue-900 text-2xl">{score.correct} / {score.total}</strong> ข้อ <span className="text-sm">({score.percentage}%)</span></p>
                      {score.percentage >= course.passingPercentage ? (
                        <div className="bg-green-100 border border-green-300 p-6 rounded-xl inline-block max-w-md w-full mb-6 shadow-sm"><p className="text-green-800 font-bold text-xl mb-2">🎉 ยินดีด้วย! คุณผ่านเกณฑ์การทดสอบ</p><p className="text-green-700 text-sm mb-4">ระบบได้ทำการอัปเดตสถานะและออกวุฒิบัตรให้คุณแล้ว</p><button onClick={() => setShowCertificate(true)} className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-bold shadow flex items-center justify-center gap-2"><span>📜</span> ดูวุฒิบัตรและบันทึก PDF</button></div>
                      ) : ( <div className="bg-red-50 border border-red-200 p-6 rounded-xl inline-block max-w-md w-full mb-6"><p className="text-red-700 font-bold text-lg mb-2">❌ คุณยังไม่ผ่านเกณฑ์ที่กำหนด ({course.passingPercentage}%)</p><p className="text-red-600 text-sm mb-4">กรุณากลับไปทบทวนเนื้อหาและลองทำแบบทดสอบใหม่อีกครั้ง</p><button onClick={() => setExamState('intro')} className="w-full bg-slate-200 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-300 transition font-bold shadow">ทำแบบทดสอบอีกครั้ง 🔄</button></div> )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          {activeTab === 'passed' && (
            <div className="w-full max-w-4xl mx-auto"><h3 className="text-xl font-bold text-slate-800 mb-4 flex justify-between items-center">ทำเนียบผู้ผ่านการอบรม<span className="text-sm font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200">ผ่านแล้ว {passedUsersForThisCourse.length} คน</span></h3><div className="border border-slate-200 rounded-lg overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50 border-b"><tr><th className="p-4 text-slate-600 font-bold">ชื่อ - นามสกุล</th><th className="p-4 text-slate-600 font-bold text-right">วันที่ผ่าน</th></tr></thead><tbody className="divide-y divide-slate-100">
              {passedUsersForThisCourse.map(record => ( <tr key={record.id} className="hover:bg-slate-50"><td className="p-4 flex items-center gap-3"><div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-900">{record.userName.substring(0,2)}</div> {record.userName}</td><td className="p-4 text-right text-slate-500">{record.datePassed}</td></tr> ))}
              {passedUsersForThisCourse.length === 0 && <tr><td colSpan={2} className="p-8 text-center text-slate-400">ยังไม่มีผู้ผ่านการอบรมในหลักสูตรนี้</td></tr>}
            </tbody></table></div></div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- [4] ระบบค้นหาวุฒิบัตร ---
const CertificateSearchView = ({ certRecords, settings }: { certRecords: CertificateRecord[], settings: SystemSettings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCert, setSelectedCert] = useState<CertificateRecord | null>(null);

  const filteredRecords = certRecords.filter(r => r.userName.toLowerCase().includes(searchTerm.toLowerCase()) || r.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto w-full">
      {selectedCert && <CertificateModal studentName={selectedCert.userName} courseTitle={selectedCert.courseTitle} datePassed={selectedCert.datePassed} settings={settings} onClose={() => setSelectedCert(null)} />}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200"><h2 className="text-2xl font-bold text-blue-900 mb-2 flex items-center gap-2"><span>🔍</span> ระบบค้นหาวุฒิบัตร (Certificate Verify)</h2><p className="text-slate-600 mb-6">พิมพ์ชื่อ-นามสกุล หรือชื่อหลักสูตร เพื่อค้นหาและดาวน์โหลดวุฒิบัตร</p><input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="ค้นหาชื่อ นามสกุล หรือหลักสูตร..." className="w-full px-6 py-4 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 text-lg shadow-inner"/></div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"><div className="p-4 bg-slate-50 border-b flex justify-between items-center"><h3 className="font-bold text-slate-700">ผลการค้นหา</h3><span className="text-sm font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">พบ {filteredRecords.length} รายการ</span></div>
        {filteredRecords.length > 0 ? (
          <div className="overflow-x-auto"><table className="w-full text-left whitespace-nowrap"><thead className="bg-white border-b"><tr><th className="p-4 text-slate-500">ชื่อผู้สอบผ่าน</th><th className="p-4 text-slate-500 w-full">หลักสูตร</th><th className="p-4 text-slate-500">วันที่ผ่าน</th><th className="p-4 text-right text-slate-500">วุฒิบัตร</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredRecords.map(record => (<tr key={record.id} className="hover:bg-slate-50 transition"><td className="p-4 font-bold text-slate-800">{record.userName}</td><td className="p-4 text-slate-600 whitespace-normal min-w-[200px]">{record.courseTitle}</td><td className="p-4 text-slate-500">{record.datePassed}</td><td className="p-4 text-right"><button onClick={() => setSelectedCert(record)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg transition shadow flex items-center gap-2 w-full justify-center md:w-auto"><span>📜</span> พิมพ์ / ดูวุฒิบัตร</button></td></tr>))}</tbody></table></div>
        ) : (<div className="py-16 text-center flex flex-col items-center"><div className="text-6xl mb-4 opacity-20">📭</div><p className="text-slate-500 font-bold text-lg">ไม่พบข้อมูลการสอบผ่าน</p><p className="text-slate-400 text-sm">ลองค้นหาด้วยชื่อ-นามสกุล หรือ ตรวจสอบว่าสอบผ่านเกณฑ์แล้วหรือไม่</p></div>)}
      </div>
    </div>
  );
};

// --- [5] หน้าแอดมิน: ตั้งค่าระบบ ---
const AdminSystemSettingsView = ({ settings, onSaveSettings }: { settings: SystemSettings, onSaveSettings: (s: SystemSettings) => void }) => {
  const [formData, setFormData] = useState<SystemSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);
  const handleSave = () => { onSaveSettings(formData); setIsSaved(true); setTimeout(() => setIsSaved(false), 3000); };

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center border-b pb-4"><h2 className="text-2xl font-bold text-slate-800">⚙️ ตั้งค่าระบบและวุฒิบัตร</h2><button onClick={handleSave} className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-bold shadow-md transition flex items-center gap-2">💾 บันทึกการตั้งค่า</button></div>
      {isSaved && <div className="bg-green-100 text-green-800 p-4 rounded-lg font-bold border border-green-300 shadow-sm">✅ บันทึกข้อมูลสำเร็จ! ข้อมูลนี้จะถูกนำไปใช้ออกใบประกาศนียบัตร</div>}
      <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8 space-y-8">
        <div><h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">1. ข้อมูลหน่วยงานหลัก</h3><div className="space-y-4"><div><label className="block text-sm font-bold text-slate-700 mb-1">ชื่อหน่วยงาน / องค์กร (แสดงหัวกระดาษ)</label><input type="text" value={formData.orgName} onChange={e => setFormData({...formData, orgName: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-900" /></div><div><label className="block text-sm font-bold text-slate-700 mb-1">โลโก้หน่วยงาน (URL รูปภาพ)</label><input type="text" value={formData.logoUrl} onChange={e => setFormData({...formData, logoUrl: e.target.value})} className="w-full px-4 py-2 border rounded-lg font-mono text-sm text-blue-600" /></div></div></div>
        <div><h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">2. ข้อมูลผู้ลงนาม (ลายเซ็นบนวุฒิบัตร)</h3><div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-bold text-slate-700 mb-1">ชื่อผู้ลงนาม (เช่น (นาย...))</label><input type="text" value={formData.signatoryName} onChange={e => setFormData({...formData, signatoryName: e.target.value})} className="w-full px-4 py-2 border rounded-lg" /></div><div><label className="block text-sm font-bold text-slate-700 mb-1">ตำแหน่ง</label><input type="text" value={formData.signatoryTitle} onChange={e => setFormData({...formData, signatoryTitle: e.target.value})} className="w-full px-4 py-2 border rounded-lg" /></div></div><div><label className="block text-sm font-bold text-slate-700 mb-1">ภาพลายเซ็น (URL พื้นหลังใส PNG)</label><input type="text" value={formData.signatureUrl} onChange={e => setFormData({...formData, signatureUrl: e.target.value})} className="w-full px-4 py-2 border rounded-lg font-mono text-sm text-blue-600" /></div></div></div>
      </div>
    </div>
  );
};

// --- [6] หน้าแอดมิน: จัดการและแก้ไขหลักสูตร ---
const AdminManagerView = ({ courses, onSaveCourse }: { courses: Course[], onSaveCourse: (c: Course) => void }) => {
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const toggleStatus = (course: Course) => onSaveCourse({ ...course, isActive: !course.isActive });

  const handleCreateNew = () => {
    setEditingCourse({
      id: Date.now(), title: 'หลักสูตรใหม่', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400&h=250', intro: '', isActive: false, passingPercentage: 80,
      instructors: [{ id: Date.now(), name: '', role: '', description: '', image: '' }], contents: [], exam: []
    });
  };

  if (!editingCourse) {
    return (
      <div className="space-y-6 animate-fade-in w-full max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4"><h2 className="text-2xl font-bold text-slate-800">🛠️ จัดการหลักสูตรทั้งหมด</h2><button onClick={handleCreateNew} className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-bold shadow-md transition flex items-center gap-2"><span>➕</span> สร้างหลักสูตรใหม่</button></div>
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto"><table className="w-full text-left whitespace-nowrap"><thead className="bg-slate-50 border-b"><tr><th className="p-4 text-slate-600 font-bold">รูปภาพ</th><th className="p-4 text-slate-600 font-bold w-full">ชื่อหลักสูตร</th><th className="p-4 text-slate-600 font-bold">สถานะ</th><th className="p-4 text-right text-slate-600 font-bold">จัดการ</th></tr></thead><tbody className="divide-y divide-slate-100">{courses.map(course => (<tr key={course.id} className="hover:bg-slate-50 transition"><td className="p-4 w-24"><img src={course.image} className="w-20 h-12 object-cover rounded shadow-sm" alt="thumb"/></td><td className="p-4 font-bold text-slate-700 whitespace-normal min-w-[250px]">{course.title}</td><td className="p-4"><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" checked={course.isActive} onChange={() => toggleStatus(course)} /><div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div><span className={`ml-3 text-sm font-bold ${course.isActive ? 'text-green-600' : 'text-slate-400'}`}>{course.isActive ? 'เปิด (Active)' : 'ปิด (Inactive)'}</span></label></td><td className="p-4 text-right"><button onClick={() => setEditingCourse(course)} className="text-blue-700 hover:text-white border border-blue-200 hover:bg-blue-700 font-bold px-4 py-2 rounded transition inline-flex items-center gap-2">✏️ แก้ไขข้อมูล</button></td></tr>))}</tbody></table></div>
      </div>
    );
  }

  return <AdminCourseEditor course={editingCourse} onSave={(updated) => { onSaveCourse(updated); setEditingCourse(null); }} onCancel={() => setEditingCourse(null)} />;
};

const AdminCourseEditor = ({ course, onSave, onCancel }: { course: Course, onSave: (c: Course) => void, onCancel: () => void }) => {
  const [formData, setFormData] = useState<Course>({ ...course });
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
    for (let i = 0; i < lines.length; i += 5) if (lines[i]) newQuestions.push({ id: Date.now() + i, text: lines[i], options: [lines[i+1] || '', lines[i+2] || '', lines[i+3] || '', lines[i+4] || ''], correctAnswer: 0 });
    if (newQuestions.length > 0) setFormData(prev => ({ ...prev, exam: [...prev.exam, ...newQuestions] }));
    setImportText(''); setShowImportModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in w-full relative max-w-7xl mx-auto">
      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"><div className="p-4 border-b bg-slate-50 flex justify-between items-center"><h3 className="font-bold text-lg text-slate-800">📥 นำเข้าข้อสอบจาก Word / Excel</h3><button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-red-500 font-bold">✕ ปิด</button></div><div className="p-6 flex-1 overflow-y-auto space-y-4"><div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm border border-blue-200"><strong>วิธีใช้งาน:</strong> ให้ Copy ข้อความจาก Word หรือ Excel มาวางในกล่องด้านล่าง โดยเรียงลำดับให้ <strong>1 ข้อใช้ 5 บรรทัด</strong> (คำถาม 1 บรรทัด, ตัวเลือก 4 บรรทัด)</div><textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder="วางข้อความข้อสอบที่นี่..." className="w-full h-[300px] p-4 border border-slate-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none resize-none" /></div><div className="p-4 border-t bg-slate-50 flex justify-end gap-3"><button onClick={() => setShowImportModal(false)} className="px-6 py-2 bg-white border border-slate-300 rounded-lg font-bold hover:bg-slate-100">ยกเลิก</button><button onClick={handleImportText} disabled={!importText.trim()} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 shadow-md">✅ นำเข้าข้อมูล</button></div></div></div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-300 pb-4 gap-4 mb-6">
        <div><h2 className="text-2xl font-bold text-slate-800">✏️ จัดการข้อมูลหลักสูตร</h2></div>
        <div className="space-x-3 w-full md:w-auto flex"><button onClick={onCancel} className="flex-1 md:flex-none px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-bold shadow-sm transition">ยกเลิก</button><button onClick={() => onSave(formData)} className="flex-1 md:flex-none px-6 py-2.5 bg-blue-900 text-white hover:bg-blue-800 rounded-lg font-bold shadow-md transition">💾 บันทึกทั้งหมด</button></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"><h3 className="text-lg font-bold mb-4 flex items-center gap-2"><span className="bg-blue-100 text-blue-900 w-8 h-8 rounded-full flex items-center justify-center">1</span> ข้อมูลทั่วไป (Introduction)</h3><div className="space-y-4"><div><label className="block text-sm font-bold mb-1">ชื่อหลักสูตร</label><input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-900" /></div><div><label className="block text-sm font-bold mb-1">หน้าปกหลักสูตร (URL รูปภาพ)</label><input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-900 text-sm font-mono text-blue-600" /></div><div><label className="block text-sm font-bold mb-1">คำอธิบาย / บทนำ</label><textarea rows={3} value={formData.intro} onChange={e => setFormData({...formData, intro: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-900" /></div></div></div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"><div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold flex items-center gap-2"><span className="bg-blue-100 text-blue-900 w-8 h-8 rounded-full flex items-center justify-center">2</span> ผู้พัฒนาหลักสูตร</h3><span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{formData.instructors.length} ท่าน</span></div><div className="space-y-6">{formData.instructors.map((inst, index) => (<div key={inst.id} className="p-5 border border-slate-200 rounded-lg bg-slate-50 relative group">{formData.instructors.length > 1 && <button onClick={() => handleRemoveInstructor(inst.id)} className="absolute -top-3 -right-3 bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 font-bold transition shadow-sm">✕</button>}<p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wide">ผู้พัฒนาคนที่ {index + 1}</p><div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-bold mb-1">ชื่อ - นามสกุล</label><input type="text" value={inst.name} onChange={e => { const newInsts = [...formData.instructors]; newInsts[index] = { ...newInsts[index], name: e.target.value }; setFormData({...formData, instructors: newInsts}); }} className="w-full px-4 py-2 border border-slate-300 rounded-lg" /></div><div><label className="block text-sm font-bold mb-1">ตำแหน่ง / หน่วยงาน</label><input type="text" value={inst.role} onChange={e => { const newInsts = [...formData.instructors]; newInsts[index] = { ...newInsts[index], role: e.target.value }; setFormData({...formData, instructors: newInsts}); }} className="w-full px-4 py-2 border border-slate-300 rounded-lg" /></div></div><div><label className="block text-sm font-bold mb-1">รูปโปรไฟล์ (URL)</label><input type="text" value={inst.image} onChange={e => { const newInsts = [...formData.instructors]; newInsts[index] = { ...newInsts[index], image: e.target.value }; setFormData({...formData, instructors: newInsts}); }} className="w-full px-4 py-2 border border-slate-300 rounded-lg font-mono text-sm" /></div><div><label className="block text-sm font-bold mb-1">ประวัติโดยย่อ</label><textarea rows={2} value={inst.description} onChange={e => { const newInsts = [...formData.instructors]; newInsts[index] = { ...newInsts[index], description: e.target.value }; setFormData({...formData, instructors: newInsts}); }} className="w-full px-4 py-2 border border-slate-300 rounded-lg" /></div></div></div>))}<button onClick={handleAddInstructor} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-500 hover:text-blue-600 font-bold flex items-center justify-center gap-2"><span>➕</span> เพิ่มผู้พัฒนาหลักสูตรอีกท่าน</button></div></div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"><h3 className="text-lg font-bold mb-4 flex items-center gap-2"><span className="bg-blue-100 text-blue-900 w-8 h-8 rounded-full flex items-center justify-center">3</span> เนื้อหาบทเรียน (Contents)</h3><div className="space-y-4">{formData.contents.map((mod, index) => (<div key={mod.id} className="p-4 border rounded-lg bg-slate-50 relative group"><button onClick={() => handleRemoveContent(mod.id)} className="absolute -top-3 -right-3 bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 font-bold shadow-sm">✕</button><p className="text-xs font-bold text-slate-400 mb-2">บทที่ {index + 1}</p><div className="flex flex-col sm:flex-row gap-3 mb-3"><select value={mod.type} onChange={e => { const newContents = [...formData.contents]; newContents[index] = { ...newContents[index], type: e.target.value as 'video'|'pdf' }; setFormData({...formData, contents: newContents}); }} className="px-3 py-2 border rounded-lg bg-white font-bold"><option value="video">🎥 Video (YouTube)</option><option value="pdf">📄 เอกสาร PDF / PPT</option></select><input type="text" value={mod.title} placeholder="ชื่อหัวข้อบทเรียน..." onChange={e => { const newContents = [...formData.contents]; newContents[index] = { ...newContents[index], title: e.target.value }; setFormData({...formData, contents: newContents}); }} className="flex-1 px-4 py-2 border rounded-lg" /></div><div><input type="text" value={mod.url} onChange={e => { const newContents = [...formData.contents]; newContents[index] = { ...newContents[index], url: e.target.value }; setFormData({...formData, contents: newContents}); }} placeholder={mod.type === 'video' ? "ลิงก์ YouTube..." : "ลิงก์ไฟล์ PDF..."} className="w-full px-4 py-2 border rounded-lg font-mono text-sm text-blue-600" /></div></div>))}<button onClick={handleAddContent} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-500 hover:text-blue-600 font-bold flex items-center justify-center gap-2"><span>➕</span> เพิ่มบทเรียนใหม่</button></div></div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4 border-b pb-4 shrink-0">
            <div><h3 className="text-lg font-bold flex items-center gap-2"><span className="bg-blue-100 text-blue-900 w-8 h-8 rounded-full flex items-center justify-center">4</span> แบบประเมิน (Exam)</h3><div className="mt-2 ml-10 flex items-center gap-2 text-sm text-slate-600 font-bold">เกณฑ์ผ่าน: <input type="number" value={formData.passingPercentage} onChange={e => setFormData({...formData, passingPercentage: Number(e.target.value)})} className="w-16 px-2 py-1 border rounded text-center text-blue-900" min="1" max="100"/> %</div></div>
            <div className="flex flex-wrap gap-2 w-full xl:w-auto"><button onClick={handleAddQuestionManual} className="flex-1 xl:flex-none px-4 py-2.5 rounded-lg font-bold text-sm bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition shadow-sm">➕ เพิ่มข้อสอบเอง</button><button onClick={() => setShowImportModal(true)} className="flex-1 xl:flex-none px-4 py-2.5 rounded-lg font-bold text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition shadow-sm">📥 นำเข้าจากข้อความ</button></div>
          </div>
          
          <div className="flex-1 space-y-4">
            {formData.exam.map((q, qIndex) => (
              <div key={q.id} className="p-5 border border-slate-300 rounded-xl bg-white relative shadow-sm">
                <button onClick={() => setFormData({...formData, exam: formData.exam.filter(x => x.id !== q.id)})} className="absolute top-4 right-4 text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-full w-8 h-8 flex items-center justify-center transition" title="ลบข้อนี้">🗑️</button>
                <div className="mb-4 pr-10"><label className="font-bold text-slate-800 flex items-center gap-2 mb-2"><span className="text-blue-600">ข้อ {qIndex + 1}.</span> คำถาม</label><input type="text" value={q.text} onChange={(e) => { const newExam = [...formData.exam]; newExam[qIndex].text = e.target.value; setFormData({...formData, exam: newExam}); }} placeholder="พิมพ์คำถามที่นี่..." className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none" /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{q.options.map((opt, oIndex) => (<div key={oIndex} className={`p-3 border rounded-lg flex items-center gap-3 transition ${q.correctAnswer === oIndex ? 'bg-green-50 border-green-400 shadow-inner' : 'bg-slate-50 border-slate-200'}`}><input type="radio" name={`correct-${q.id}`} checked={q.correctAnswer === oIndex} onChange={() => { const newExam = [...formData.exam]; newExam[qIndex].correctAnswer = oIndex; setFormData({...formData, exam: newExam}); }} className="w-5 h-5 text-green-600 cursor-pointer shrink-0" title="เลือกเป็นข้อที่ถูก" /> <input type="text" value={opt} onChange={(e) => { const newExam = [...formData.exam]; newExam[qIndex].options[oIndex] = e.target.value; setFormData({...formData, exam: newExam}); }} placeholder={`ตัวเลือกที่ ${oIndex + 1}`} className="flex-1 px-3 py-1.5 border border-slate-300 rounded bg-white text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none" /></div>))}</div>
              </div>
            ))}
            {formData.exam.length === 0 && <div className="text-center py-16 border-2 border-dashed rounded-xl bg-slate-50 flex flex-col items-center justify-center"><h4 className="font-bold text-slate-500">ยังไม่มีแบบทดสอบในระบบ กดปุ่มด้านบนเพื่อเพิ่ม</h4></div>}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-300"><button onClick={onCancel} className="px-8 py-3 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-bold shadow-sm transition text-lg">ยกเลิก</button><button onClick={() => onSave(formData)} className="px-8 py-3 bg-blue-900 text-white hover:bg-blue-800 rounded-lg font-bold shadow-md transition text-lg">💾 บันทึกการเปลี่ยนแปลงทั้งหมด</button></div>
    </div>
  );
};


// --- [7] หน้าแอดมิน: จัดการสมาชิก ---
const AdminUserManagementView = ({ usersDb, onUpdateUser, onDeleteUser }: { usersDb: User[], onUpdateUser: (u: User) => void, onDeleteUser: (id: number) => void }) => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreateNew = () => {
    setEditingUser({ id: Date.now(), username: '', password: '', name: '', role: 'user', registerSource: 'admin' });
    setIsCreating(true); setError('');
  };

  const handleEdit = (user: User) => {
    setEditingUser(user); setIsCreating(false); setError('');
  };

  const handleSave = () => {
    if (editingUser) {
      if (!editingUser.username || !editingUser.password || !editingUser.name) return setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      if (isCreating && usersDb.some(u => u.username === editingUser.username)) return setError('ชื่อผู้ใช้งาน (Username) นี้มีในระบบแล้ว');
      onUpdateUser(editingUser);
      setEditingUser(null); setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
        <div className="flex items-center gap-3"><h2 className="text-2xl font-bold text-slate-800">👥 จัดการสมาชิกในระบบ</h2><span className="text-sm font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full hidden sm:block">มีสมาชิกทั้งหมด {usersDb.length} คน</span></div>
        {!editingUser && (<button onClick={handleCreateNew} className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-bold shadow-md transition flex items-center gap-2"><span>➕</span> สร้างสมาชิกใหม่</button>)}
      </div>

      {editingUser ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 w-full max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">{isCreating ? '➕ สร้างบัญชีผู้ใช้งานใหม่' : '✏️ แก้ไขข้อมูลสมาชิก'}</h3>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold mb-6 border border-red-200 text-center">{error}</div>}
          <div className="space-y-4">
            <div><label className="block text-sm font-bold text-slate-700 mb-1">ชื่อผู้ใช้งาน (Username) {isCreating ? '' : ' - *ห้ามแก้ไข'}</label><input type="text" value={editingUser.username} onChange={e => setEditingUser({...editingUser, username: e.target.value})} disabled={!isCreating} className={`w-full px-4 py-2 border rounded-lg ${!isCreating ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-900'}`} placeholder="เช่น student01" /></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1">ชื่อ - นามสกุล (สำหรับออกวุฒิบัตร)</label><input type="text" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-900" placeholder="ชื่อ-นามสกุลจริง..." /></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1">รหัสผ่าน (Password)</label><input type="text" value={editingUser.password} onChange={e => setEditingUser({...editingUser, password: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-900" placeholder="ตั้งรหัสผ่าน..." /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-bold text-slate-700 mb-1">ระดับสิทธิ์ (Role)</label><select value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as 'admin'|'user'})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-900"><option value="user">ผู้ใช้งานทั่วไป (User)</option><option value="admin">ผู้ดูแลระบบ (Admin)</option></select></div>
              <div><label className="block text-sm font-bold text-slate-700 mb-1">ช่องทางการสมัคร</label><select value={editingUser.registerSource || 'web'} disabled className="w-full px-4 py-2 border rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"><option value="web">หน้าเว็บไซต์ (Web)</option><option value="admin">ผู้ดูแลระบบ (Admin)</option><option value="line">LINE OA (Line)</option></select></div>
            </div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1">LINE User ID (ถ้ามีการผูกบัญชี)</label><input type="text" value={editingUser.lineUserId || ''} disabled className="w-full px-4 py-2 border rounded-lg bg-slate-50 text-slate-400 font-mono text-sm cursor-not-allowed" placeholder="ยังไม่ได้ผูกบัญชี LINE" /></div>
          </div>
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100"><button onClick={() => { setEditingUser(null); setIsCreating(false); setError(''); }} className="px-6 py-2 bg-white border border-slate-300 rounded-lg font-bold hover:bg-slate-100">ยกเลิก</button><button onClick={handleSave} className="px-6 py-2 bg-blue-900 text-white rounded-lg font-bold hover:bg-blue-800 shadow-md">💾 บันทึกข้อมูล</button></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap"><thead className="bg-slate-50 border-b"><tr><th className="p-4 text-slate-500 font-bold">ชื่อผู้ใช้งาน</th><th className="p-4 text-slate-500 font-bold w-full">ชื่อ - นามสกุล</th><th className="p-4 text-slate-500 font-bold">รหัสผ่าน</th><th className="p-4 text-slate-500 font-bold text-center">ช่องทาง</th><th className="p-4 text-slate-500 font-bold text-center">สิทธิ์</th><th className="p-4 text-right text-slate-500 font-bold">จัดการ</th></tr></thead><tbody className="divide-y divide-slate-100">
              {usersDb.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-bold text-slate-800">{user.username}</td>
                  <td className="p-4 text-slate-700">{user.name}</td>
                  <td className="p-4 text-slate-500 font-mono text-sm">{user.password}</td>
                  <td className="p-4 text-center">
                    {user.registerSource === 'admin' && <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">Admin</span>}
                    {user.registerSource === 'line' && <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">LINE</span>}
                    {(!user.registerSource || user.registerSource === 'web') && <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded">Web</span>}
                  </td>
                  <td className="p-4 text-center"><span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>{user.role.toUpperCase()}</span></td>
                  <td className="p-4 text-right flex gap-2 justify-end">
                    <button onClick={() => handleEdit(user)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-lg transition text-sm">✏️ แก้ไข</button>
                    {user.role !== 'admin' && (<button onClick={() => { if(window.confirm(`ต้องการลบผู้ใช้ ${user.username} ใช่หรือไม่?`)) onDeleteUser(user.id); }} className="bg-red-100 hover:bg-red-200 text-red-700 font-bold px-4 py-2 rounded-lg transition text-sm">🗑️ ลบ</button>)}
                  </td>
                </tr>
              ))}
            </tbody></table>
        </div>
      )}
    </div>
  );
};


// --- [8] โครงสร้างหลักที่เชื่อมต่อฐานข้อมูล Firebase ---
export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentMenu, setCurrentMenu] = useState('home'); 
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  // States
  const [usersDb, setUsersDb] = useState<User[]>(mockUsersDb);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [settings, setSettings] = useState<SystemSettings>(initialSettings);
  const [certRecords, setCertRecords] = useState<CertificateRecord[]>([]);

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, "settings", "main"), (docSnap) => {
      if (docSnap.exists()) setSettings(docSnap.data() as SystemSettings);
      else setDoc(doc(db, "settings", "main"), initialSettings);
    });

    const unsubCourses = onSnapshot(collection(db, "courses"), (snapshot) => {
      const coursesData = snapshot.docs.map(doc => doc.data() as Course);
      if (coursesData.length > 0) setCourses(coursesData);
      else setDoc(doc(db, "courses", initialCourses[0].id.toString()), initialCourses[0]);
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = snapshot.docs.map(doc => doc.data() as User);
      if (usersData.length > 0) setUsersDb(usersData);
      else setDoc(doc(db, "users", mockUsersDb[0].id.toString()), mockUsersDb[0]);
    });

    const unsubCerts = onSnapshot(collection(db, "certificates"), (snapshot) => {
      const certsData = snapshot.docs.map(doc => doc.data() as CertificateRecord);
      setCertRecords(certsData);
      setLoading(false);
    });

    return () => { unsubSettings(); unsubCourses(); unsubUsers(); unsubCerts(); };
  }, []);

  const handleSaveCourse = async (updatedCourse: Course) => await setDoc(doc(db, "courses", updatedCourse.id.toString()), updatedCourse);
  const handleSaveSettings = async (updatedSettings: SystemSettings) => await setDoc(doc(db, "settings", "main"), updatedSettings);
  const handleSaveCert = async (newCert: CertificateRecord) => await setDoc(doc(db, "certificates", newCert.id.toString()), newCert);
  const handleRegisterUser = async (newUser: User) => await setDoc(doc(db, "users", newUser.id.toString()), newUser);
  const handleUpdateUser = async (updatedUser: User) => await setDoc(doc(db, "users", updatedUser.id.toString()), updatedUser);
  const handleDeleteUser = async (userId: number) => await deleteDoc(doc(db, "users", userId.toString()));

  if (loading) return <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50"><div className="text-5xl animate-spin mb-4">⏳</div><h2 className="text-xl font-bold text-blue-900">กำลังเชื่อมต่อฐานข้อมูล...</h2></div>;
  
  if (!currentUser) return <LoginRegisterView onLogin={setCurrentUser} usersDb={usersDb} onRegister={handleRegisterUser} onUpdateUser={handleUpdateUser} />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-blue-900 text-white shadow-md sticky top-0 z-40 w-full">
        <div className="px-4 md:px-8 py-3 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
           <div className="flex items-center justify-between w-full md:w-auto">
             <div className="flex items-center gap-3">
               <h1 className="text-2xl font-bold tracking-wide">E-Learning</h1>
               <div className="hidden lg:block h-6 w-px bg-blue-700"></div>
               <p className="text-blue-200 text-sm hidden lg:block whitespace-nowrap">{settings.orgName}</p>
             </div>
             <button onClick={() => setCurrentUser(null)} className="md:hidden text-red-300 hover:text-white transition font-bold">🚪 ออกจากระบบ</button>
           </div>
           <nav className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide text-sm md:text-base">
             <button onClick={() => setCurrentMenu('home')} className={`whitespace-nowrap px-4 py-2 rounded-lg transition flex items-center gap-2 ${currentMenu==='home' || currentMenu==='detail' ? 'bg-blue-800 font-bold text-white shadow-inner' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`}>🏠 หน้าแรก</button>
             <button onClick={() => setCurrentMenu('search_cert')} className={`whitespace-nowrap px-4 py-2 rounded-lg transition flex items-center gap-2 ${currentMenu==='search_cert' ? 'bg-blue-800 font-bold text-white shadow-inner' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`}>🔍 ค้นหาวุฒิบัตร</button>
             
             {currentUser.role === 'admin' && (
               <>
                 <div className="h-6 w-px bg-blue-800 hidden sm:block mx-2"></div>
                 <button onClick={() => setCurrentMenu('users')} className={`whitespace-nowrap px-4 py-2 rounded-lg transition flex items-center gap-2 ${currentMenu==='users' ? 'bg-blue-800 font-bold text-white shadow-inner' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`}>👥 จัดการสมาชิก</button>
                 <button onClick={() => setCurrentMenu('admin')} className={`whitespace-nowrap px-4 py-2 rounded-lg transition flex items-center gap-2 ${currentMenu==='admin' ? 'bg-blue-800 font-bold text-white shadow-inner' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`}>🛠️ จัดการหลักสูตร</button>
                 <button onClick={() => setCurrentMenu('settings')} className={`whitespace-nowrap px-4 py-2 rounded-lg transition flex items-center gap-2 ${currentMenu==='settings' ? 'bg-blue-800 font-bold text-white shadow-inner' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`}>⚙️ ตั้งค่าระบบ</button>
               </>
             )}
           </nav>
           <div className="hidden md:flex items-center gap-3 shrink-0">
             <div className="text-right">
               <p className="text-sm font-bold">{currentUser.name}</p>
               <p className="text-xs text-blue-300 uppercase">{currentUser.role}</p>
             </div>
             <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-900 font-bold shadow-inner">{currentUser.username[0].toUpperCase()}</div>
             <button onClick={() => setCurrentUser(null)} className="ml-2 text-red-300 hover:text-red-400 transition bg-blue-800 hover:bg-blue-700 p-2 rounded-lg" title="ออกจากระบบ">🚪</button>
           </div>
        </div>
      </header>

      <main className="flex-1 w-full p-4 md:p-8 overflow-y-auto">
        <div className="w-full">
          {currentMenu === 'home' && <CourseCatalogView courses={courses} settings={settings} onViewCourse={(c) => { setSelectedCourse(c); setCurrentMenu('detail'); }} />}
          {currentMenu === 'detail' && selectedCourse && <CourseDetailView course={selectedCourse} settings={settings} currentUser={currentUser} certRecords={certRecords} onSaveCert={handleSaveCert} onBack={() => setCurrentMenu('home')} />}
          {currentMenu === 'search_cert' && <CertificateSearchView certRecords={certRecords} settings={settings} />}
          {currentMenu === 'users' && currentUser.role === 'admin' && <AdminUserManagementView usersDb={usersDb} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} />}
          {currentMenu === 'admin' && currentUser.role === 'admin' && <AdminManagerView courses={courses} onSaveCourse={handleSaveCourse} />}
          {currentMenu === 'settings' && currentUser.role === 'admin' && <AdminSystemSettingsView settings={settings} onSaveSettings={handleSaveSettings} />}
        </div>
      </main>
    </div>
  );
}