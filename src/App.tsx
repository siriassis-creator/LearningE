import React, { useState } from 'react';

// --- [1] หน้า Login ---
const LoginView = ({ onLogin }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-slate-200">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">ระบบ E-Learning</h1>
        <p className="text-slate-500 mt-2">สพป.ราชบุรี เขต 1</p>
      </div>
      <div className="space-y-4">
        <div><label className="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้ใช้งาน</label><input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none" placeholder="Username" /></div>
        <div><label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่าน</label><input type="password" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none" placeholder="Password" /></div>
        <button onClick={onLogin} className="w-full bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-800 transition shadow-md font-medium">เข้าสู่ระบบ</button>
        <div className="relative flex items-center py-2"><div className="flex-grow border-t border-slate-300"></div><span className="flex-shrink-0 mx-4 text-slate-400 text-sm">หรือ</span><div className="flex-grow border-t border-slate-300"></div></div>
        <button className="w-full bg-[#00B900] text-white py-2 rounded-lg hover:bg-[#009900] transition shadow-md flex items-center justify-center gap-2 font-medium"><span className="text-xl">💬</span> เข้าสู่ระบบด้วย LINE</button>
      </div>
    </div>
  </div>
);

// --- [2] หน้าแรก: คลังหลักสูตร (Course Catalog) พร้อมแบนเนอร์ ---
const CourseCatalogView = ({ onViewCourse }) => {
  const courses = [
    { id: 1, title: 'ระเบียบงานสารบรรณ พ.ศ. 2566', image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=400&h=250' },
    { id: 2, title: 'ความปลอดภัยทางไซเบอร์เบื้องต้น', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400&h=250' },
    { id: 3, title: 'การใช้งานสื่อดิจิทัลเพื่อการศึกษา', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400&h=250' },
    { id: 4, title: 'ทักษะการบริการและการสื่อสาร', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400&h=250' },
    { id: 5, title: 'การจัดทำแผนพัฒนาการศึกษา', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400&h=250' }
  ];

  return (
    <div className="space-y-8">
      
      {/* ส่วน Banner บทนำ (Hero Section) */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-blue-100 border-l-4 border-l-blue-900 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-3">
            <span className="text-3xl">🎓</span> การเรียนรู้ผ่านสื่ออิเล็กทรอนิกส์ (E-Learning)
          </h2>
          <p className="text-slate-600 leading-relaxed text-justify md:pr-12">
            การเรียนรู้ผ่านสื่ออิเล็กทรอนิกส์ (E-Learning) ของสำนักงานเขตพื้นที่การศึกษาประถมศึกษาราชบุรี เขต 1 จัดทำขึ้นเพื่อเป็นสื่อกลางในการเรียนรู้ทางออนไลน์ สำหรับผู้บริหารโรงเรียน ครู บุคลากรทางการศึกษา และประชาชนทั่วไป เพื่อพัฒนาความรู้ ความสามารถ และความสนใจ และเป็นการพัฒนาและเสริมสร้างศักยภาพทรัพยากรมนุษย์ ให้มีความพร้อมสำหรับวิถีชีวิตในศตวรรษที่ 21 
            <br/>
            โดยเนื้อหาประกอบด้วยข้อความ รูปภาพ วีดีโอ และสื่ออื่น ๆ โดยอาศัยเครื่องมือติดต่อสื่อสารที่ทันสมัย เช่น E-Mail เป็นการเรียนรู้สำหรับทุกคน เรียนรู้ได้ทุกที่ ทุกเวลา ทุกสถานที่ โดยผู้ผ่านการทดสอบประเมินความรู้ ความเข้าใจ แต่ละหลักสูตรจะได้รับวุฒิบัตรส่งกลับทางอีเมล์
          </p>
        </div>
        <div className="absolute top-0 right-0 -mt-6 -mr-6 text-9xl opacity-5 select-none hidden xl:block">🖥️</div>
      </div>

      {/* ส่วนรายการหลักสูตร */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-4 mb-6 flex items-center gap-2">
          <span>📚</span> หลักสูตรทั้งหมด
        </h2>
        {/* ปรับให้ขยายเป็น 4 หรือ 5 คอลัมน์ได้เมื่อหน้าจอใหญ่ขึ้น */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {courses.map(course => (
            <div 
              key={course.id} 
              onClick={() => onViewCourse(course)}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-1 transition duration-200 flex flex-col"
            >
              <div className="h-48 bg-slate-200 w-full overflow-hidden">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 border-t border-slate-100 flex-1 flex flex-col justify-between">
                <h3 className="font-bold text-slate-800 text-lg line-clamp-2 leading-tight mb-3">{course.title}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-auto"><span>👥</span> ผู้เข้าเรียน: {Math.floor(Math.random() * 100) + 20} คน</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

// --- [3] หน้ารายละเอียดหลักสูตร (แบ่ง 4 ส่วน) ---
const CourseDetailView = ({ course, onBack }) => {
  const [activeTab, setActiveTab] = useState('content'); 

  return (
    <div className="space-y-6 animate-fade-in w-full">
      <button onClick={onBack} className="text-blue-600 hover:text-blue-900 flex items-center gap-2 font-medium bg-blue-50 px-4 py-2 rounded-lg inline-flex transition">
        <span>⬅️</span> กลับไปหน้าหลักสูตร
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full">
        <div className="h-48 lg:h-64 bg-blue-900 text-white p-8 flex flex-col justify-end relative overflow-hidden">
           <img src={course.image} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="bg" />
           <div className="absolute inset-0 bg-gradient-to-t from-blue-900 to-transparent opacity-80"></div>
           <h2 className="text-3xl lg:text-4xl font-bold relative z-10">{course.title}</h2>
        </div>

        <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto scrollbar-hide">
          {[
            { id: 'content', label: '1. เนื้อหาบทเรียน', icon: '📚' },
            { id: 'instructor', label: '2. ผู้พัฒนาหลักสูตร', icon: '👨‍🏫' },
            { id: 'exam', label: '3. แบบทดสอบ', icon: '📝' },
            { id: 'passed', label: '4. ผู้ผ่านการอบรม', icon: '🏆' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-6 text-sm lg:text-base font-bold flex items-center justify-center gap-2 transition whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-b-4 border-blue-900 text-blue-900 bg-white' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8 min-h-[300px]">
          {activeTab === 'content' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800 mb-4">เนื้อหาการเรียนรู้</h3>
              {['บทนำ: ความสำคัญของหลักสูตร', 'หน่วยที่ 1: กฎระเบียบและข้อบังคับเบื้องต้น', 'หน่วยที่ 2: กรณีศึกษาและการนำไปใช้จริง'].map((lesson, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-blue-50 transition cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center font-bold group-hover:bg-blue-900 group-hover:text-white transition">{idx + 1}</div>
                    <span className="font-medium text-slate-700">{lesson}</span>
                  </div>
                  <span className="text-blue-500 font-medium">▶️ เข้าเรียน</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'instructor' && (
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="w-32 h-32 bg-slate-200 rounded-full overflow-hidden border-4 border-white shadow-md shrink-0">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200" alt="Instructor" className="w-full h-full object-cover"/>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">อ. สมชาย รักเรียน</h3>
                <p className="text-blue-600 font-medium mb-4">ผู้เชี่ยวชาญด้านการจัดทำสื่อการศึกษา</p>
                <p className="text-slate-600 leading-relaxed max-w-4xl">รับผิดชอบการออกแบบและพัฒนาเนื้อหาการเรียนรู้ผ่านสื่ออิเล็กทรอนิกส์ (E-Learning) เพื่อสนับสนุนบุคลากรทางการศึกษา</p>
              </div>
            </div>
          )}

          {activeTab === 'exam' && (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100 w-full max-w-3xl mx-auto">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">แบบประเมินผลความรู้</h3>
              <p className="text-slate-600 mb-6">ข้อสอบปรนัย (เกณฑ์การผ่าน 80%) <br/>ผู้ที่สอบผ่านจะได้รับวุฒิบัตรส่งกลับทางอีเมล</p>
              <button className="bg-blue-900 text-white px-8 py-3 rounded-lg hover:bg-blue-800 transition shadow-md font-bold text-lg inline-flex items-center gap-2">
                ▶️ เริ่มทำแบบทดสอบ
              </button>
            </div>
          )}

          {activeTab === 'passed' && (
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex justify-between items-center">
                ทำเนียบผู้ผ่านการอบรม
                <span className="text-sm font-normal bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200">ผ่านแล้ว 42 คน</span>
              </h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr><th className="p-4 text-slate-600 font-medium">ชื่อ - นามสกุล</th><th className="p-4 text-slate-600 font-medium">โรงเรียน / หน่วยงาน</th><th className="p-4 text-slate-600 font-medium text-right">วันที่ผ่าน</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50"><td className="p-4 flex items-center gap-3"><div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-900">วร</div> นางสาว วรรณภา สุขใจ</td><td className="p-4 text-slate-600">ร.ร. อนุบาลราชบุรี</td><td className="p-4 text-right text-slate-500">25 ต.ค. 66</td></tr>
                    <tr className="hover:bg-slate-50"><td className="p-4 flex items-center gap-3"><div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-900">พง</div> นาย พงศกร มั่นคง</td><td className="p-4 text-slate-600">สพป.ราชบุรี เขต 1</td><td className="p-4 text-right text-slate-500">24 ต.ค. 66</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- [4] หน้าตั้งค่าสร้างบทเรียน ---
const LessonBuilderView = () => (
  <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center py-20 w-full">
    <div className="text-6xl mb-4">🛠️</div><h2 className="text-2xl font-bold text-slate-800">ระบบสร้างเนื้อหาหลักสูตร (Lesson Builder)</h2><p className="text-slate-500 mt-2">พื้นที่สำหรับผู้ดูแลระบบในการเพิ่ม แก้ไข เนื้อหาวิดีโอและไฟล์ PDF</p>
  </div>
);

// --- [5] หน้าตั้งค่าสร้างข้อสอบ ---
const ExamBuilderView = () => (
  <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center py-20 w-full">
    <div className="text-6xl mb-4">⚙️</div><h2 className="text-2xl font-bold text-slate-800">ระบบตั้งค่าแบบทดสอบ (Exam Builder)</h2><p className="text-slate-500 mt-2">พื้นที่สำหรับสร้างข้อสอบและกำหนดเกณฑ์การผ่าน (%) เพื่อออกใบประกาศฯ</p>
  </div>
);

// --- [6] โครงสร้างหลัก (Layout) ---
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentMenu, setCurrentMenu] = useState('home'); 
  const [selectedCourse, setSelectedCourse] = useState(null);

  if (!isLoggedIn) {
    return <LoginView onLogin={() => setIsLoggedIn(true)} />;
  }

  const navigateToCourse = (course) => {
    setSelectedCourse(course);
    setCurrentMenu('course-detail');
  };

  const renderContent = () => {
    switch (currentMenu) {
      case 'home': return <CourseCatalogView onViewCourse={navigateToCourse} />;
      case 'course-detail': return <CourseDetailView course={selectedCourse} onBack={() => setCurrentMenu('home')} />;
      case 'settings-lessons': return <LessonBuilderView />;
      case 'settings-exams': return <ExamBuilderView />;
      default: return <CourseCatalogView onViewCourse={navigateToCourse} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar - Fix width */}
      <div className="w-64 shrink-0 bg-blue-900 text-white flex flex-col shadow-xl z-10 hidden md:flex h-screen sticky top-0">
        <div className="p-6 border-b border-blue-800 shrink-0">
          <h1 className="text-xl font-bold tracking-wide">E-Learning</h1>
          <p className="text-blue-300 text-xs mt-1">สพป.ราชบุรี เขต 1</p>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-6">
            <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-2 ml-2">เมนูหลัก</p>
            <button onClick={() => setCurrentMenu('home')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentMenu === 'home' || currentMenu === 'course-detail' ? 'bg-blue-800 text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`}>
              <span>🏠</span> หน้าแรก / หลักสูตร
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-200 hover:bg-blue-800 hover:text-white transition mt-1">
              <span>🏆</span> วุฒิบัตรของฉัน
            </button>
          </div>

          <div className="px-4 border-t border-blue-800 pt-6">
            <p className="text-xs text-orange-300 font-bold uppercase tracking-wider mb-2 ml-2">สำหรับแอดมิน</p>
            <button onClick={() => setCurrentMenu('settings-lessons')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentMenu === 'settings-lessons' ? 'bg-blue-800 text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`}>
              <span>📚</span> สร้างหลักสูตร
            </button>
            <button onClick={() => setCurrentMenu('settings-exams')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition mt-1 ${currentMenu === 'settings-exams' ? 'bg-blue-800 text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`}>
              <span>📝</span> สร้างแบบทดสอบ
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-blue-800 shrink-0">
          <button onClick={() => setIsLoggedIn(false)} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-red-500 hover:text-white transition">
            <span>🚪</span> ออกจากระบบ
          </button>
        </div>
      </div>

      {/* Main Content Area - Full Width */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 px-8 py-4 flex justify-between items-center z-0 shrink-0">
          <h2 className="text-slate-600 font-medium flex items-center gap-2 truncate"><span>🌐</span> ระบบบริหารจัดการการเรียนรู้ (LMS)</h2>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-700">สมชาย รักเรียน</p>
              <p className="text-xs text-slate-500">ผู้ดูแลระบบ</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">ส</div>
          </div>
        </header>
        
        {/* Content Wrapper - ปลดล็อกความกว้าง (Removed max-w-6xl mx-auto) ให้เต็มพื้นที่ */}
        <main className="p-4 md:p-8 w-full flex-1 overflow-y-auto bg-slate-50">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}