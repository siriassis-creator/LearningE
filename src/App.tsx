import React, { useState } from 'react';

// --- [1] หน้า Login (เหมือนเดิม) ---
const LoginView = ({ onLogin }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-slate-200">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">ระบบ E-Learning</h1>
        <p className="text-slate-500 mt-2">สำหรับบุคลากรภายในหน่วยงาน</p>
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

// --- [2] หน้าแรก: คลังหลักสูตร (Course Catalog) ---
const CourseCatalogView = ({ onViewCourse }) => {
  const courses = [
    { id: 1, title: 'ระเบียบงานสารบรรณ พ.ศ. 2566', image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=400&h=250' },
    { id: 2, title: 'ความปลอดภัยทางไซเบอร์เบื้องต้น', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400&h=250' },
    { id: 3, title: 'การใช้งาน Excel สำหรับงานธุรการ', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400&h=250' },
    { id: 4, title: 'ทักษะการบริการประชาชน (Service Mind)', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400&h=250' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 border-b pb-4">หน้าแรก / หลักสูตรทั้งหมด</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div 
            key={course.id} 
            onClick={() => onViewCourse(course)}
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-1 transition duration-200"
          >
            {/* ส่วนรูปภาพหลักสูตร/ผู้สอน */}
            <div className="h-40 bg-slate-200 w-full overflow-hidden">
              <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
            </div>
            {/* ส่วนชื่อหลักสูตร */}
            <div className="p-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-800 text-lg line-clamp-2">{course.title}</h3>
              <p className="text-sm text-slate-500 mt-2 flex items-center gap-1"><span>👥</span> ผู้เข้าเรียน: {Math.floor(Math.random() * 100) + 20} คน</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- [3] หน้ารายละเอียดหลักสูตร (แบ่ง 4 ส่วน) ---
const CourseDetailView = ({ course, onBack }) => {
  const [activeTab, setActiveTab] = useState('content'); // 'content', 'instructor', 'exam', 'passed'

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-blue-600 hover:text-blue-900 flex items-center gap-2 font-medium">
        <span>⬅️</span> กลับไปหน้าหลักสูตร
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-48 bg-blue-900 text-white p-8 flex flex-col justify-end relative overflow-hidden">
           <img src={course.image} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="bg" />
           <h2 className="text-3xl font-bold relative z-10">{course.title}</h2>
        </div>

        {/* แถบเมนู 4 ส่วน (Tabs) */}
        <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
          {[
            { id: 'content', label: '1. เนื้อหาบทเรียน', icon: '📚' },
            { id: 'instructor', label: '2. ผู้พัฒนาหลักสูตร', icon: '👨‍🏫' },
            { id: 'exam', label: '3. แบบทดสอบ', icon: '📝' },
            { id: 'passed', label: '4. ผู้ผ่านการอบรม', icon: '🏆' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 transition whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-b-4 border-blue-900 text-blue-900 bg-white' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* เนื้อหาของแต่ละ Tab */}
        <div className="p-8 min-h-[300px]">
          {/* ส่วนที่ 1: เนื้อหา */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800 mb-4">เนื้อหาการเรียนรู้</h3>
              {['บทนำ: ความสำคัญของหลักสูตร', 'หน่วยที่ 1: กฎระเบียบและข้อบังคับเบื้องต้น', 'หน่วยที่ 2: กรณีศึกษาและการนำไปใช้จริง'].map((lesson, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center font-bold">{idx + 1}</div>
                    <span className="font-medium text-slate-700">{lesson}</span>
                  </div>
                  <span className="text-slate-400">▶️ เข้าเรียน</span>
                </div>
              ))}
            </div>
          )}

          {/* ส่วนที่ 2: ผู้พัฒนาหลักสูตร */}
          {activeTab === 'instructor' && (
            <div className="flex items-start gap-6">
              <div className="w-32 h-32 bg-slate-200 rounded-full overflow-hidden border-4 border-white shadow-md">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200" alt="Instructor" className="w-full h-full object-cover"/>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">ดร. สมชาย รักเรียน</h3>
                <p className="text-blue-600 font-medium mb-4">ผู้อำนวยการฝ่ายพัฒนาทรัพยากรบุคคล</p>
                <p className="text-slate-600">ผู้เชี่ยวชาญด้านการจัดทำระเบียบงานสารบรรณ และการจัดการข้อมูลภาครัฐ มีประสบการณ์บรรยายให้กับหน่วยงานราชการมากกว่า 15 ปี</p>
              </div>
            </div>
          )}

          {/* ส่วนที่ 3: แบบทดสอบ */}
          {activeTab === 'exam' && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">แบบประเมินผลความรู้</h3>
              <p className="text-slate-600 mb-6">ข้อสอบปรนัยจำนวน 20 ข้อ (เกณฑ์การผ่าน 80%)</p>
              <button className="bg-blue-900 text-white px-8 py-3 rounded-lg hover:bg-blue-800 transition shadow-md font-bold text-lg">
                เริ่มทำแบบทดสอบ
              </button>
            </div>
          )}

          {/* ส่วนที่ 4: ผู้ผ่านการอบรม */}
          {activeTab === 'passed' && (
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex justify-between items-center">
                ทำเนียบผู้ผ่านการอบรม
                <span className="text-sm font-normal bg-green-100 text-green-700 px-3 py-1 rounded-full">ผ่านแล้ว 42 คน</span>
              </h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr><th className="p-4 text-slate-600 font-medium">ชื่อ - นามสกุล</th><th className="p-4 text-slate-600 font-medium">หน่วยงาน</th><th className="p-4 text-slate-600 font-medium text-right">วันที่ผ่าน</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr><td className="p-4 flex items-center gap-3"><div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-900">วร</div> นางสาว วรรณภา สุขใจ</td><td className="p-4 text-slate-600">ฝ่ายธุรการกลาง</td><td className="p-4 text-right text-slate-500">25 ต.ค. 66</td></tr>
                    <tr><td className="p-4 flex items-center gap-3"><div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-900">พง</div> นาย พงศกร มั่นคง</td><td className="p-4 text-slate-600">กองสารสนเทศ</td><td className="p-4 text-right text-slate-500">24 ต.ค. 66</td></tr>
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

// --- [4] หน้าตั้งค่าสร้างบทเรียน (ย้ายมาอยู่ในหมวดตั้งค่า) ---
const LessonBuilderView = () => (
  <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center py-20">
    <div className="text-6xl mb-4">🛠️</div>
    <h2 className="text-2xl font-bold text-slate-800">ระบบสร้างเนื้อหาหลักสูตร (Lesson Builder)</h2>
    <p className="text-slate-500 mt-2">พื้นที่สำหรับผู้ดูแลระบบในการเพิ่ม แก้ไข เนื้อหาวิดีโอและไฟล์ PDF</p>
  </div>
);

// --- [5] หน้าตั้งค่าสร้างข้อสอบ (ย้ายมาอยู่ในหมวดตั้งค่า) ---
const ExamBuilderView = () => (
  <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center py-20">
    <div className="text-6xl mb-4">⚙️</div>
    <h2 className="text-2xl font-bold text-slate-800">ระบบตั้งค่าแบบทดสอบ (Exam Builder)</h2>
    <p className="text-slate-500 mt-2">พื้นที่สำหรับสร้างข้อสอบและกำหนดเกณฑ์การผ่าน (%) เพื่อออกใบประกาศฯ</p>
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
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-blue-800">
          <h1 className="text-xl font-bold tracking-wide">E-Learning</h1>
          <p className="text-blue-300 text-sm mt-1">กรมการพัฒนาองค์กร</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {/* เมนูผู้ใช้งานทั่วไป */}
          <div className="p-4">
            <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-2 ml-2">เมนูหลัก</p>
            <button onClick={() => setCurrentMenu('home')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentMenu === 'home' || currentMenu === 'course-detail' ? 'bg-blue-800 text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`}>
              <span>🏠</span> หน้าแรก / หลักสูตร
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-200 hover:bg-blue-800 hover:text-white transition mt-1">
              <span>🏆</span> ใบประกาศนียบัตรของฉัน
            </button>
          </div>

          {/* เมนูผู้ดูแลระบบ (ตั้งค่า) */}
          <div className="p-4 border-t border-blue-800">
            <p className="text-xs text-orange-300 font-bold uppercase tracking-wider mb-2 ml-2">ตั้งค่าระบบ (Admin)</p>
            <button onClick={() => setCurrentMenu('settings-lessons')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentMenu === 'settings-lessons' ? 'bg-blue-800 text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`}>
              <span>📚</span> สร้างหลักสูตร
            </button>
            <button onClick={() => setCurrentMenu('settings-exams')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition mt-1 ${currentMenu === 'settings-exams' ? 'bg-blue-800 text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`}>
              <span>📝</span> สร้างแบบทดสอบ
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-blue-800">
          <button onClick={() => setIsLoggedIn(false)} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-red-500 hover:text-white transition">
            <span>🚪</span> ออกจากระบบ
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-0">
          <h2 className="text-slate-600 font-medium flex items-center gap-2"><span>🌐</span> ระบบบริหารจัดการการเรียนรู้ (LMS)</h2>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center font-bold">A</div>
            <span className="text-sm font-medium text-slate-700">สมชาย (ผู้ดูแลระบบ)</span>
          </div>
        </header>
        
        <main className="p-8 max-w-6xl mx-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}