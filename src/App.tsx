import React, { useState, useEffect } from 'react';
import { 
  User, 
  SchoolClass, 
  TeachingMaterial, 
  Lesson, 
  Question, 
  Assignment, 
  AssignmentSubmission, 
  ApprovalRecord,
  ContentStatus 
} from './types';
import { storageService } from './services/storageService';
import { subscribeToAuthChanges } from './services/firebase';
import { Header } from './components/Header';
import { SystemConfigModal } from './components/SystemConfigModal';
import { LessonDetailModal } from './components/common/LessonDetailModal';
import { FirebaseLoginModal } from './components/common/FirebaseLoginModal';

// Teacher components
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { MaterialManager } from './components/teacher/MaterialManager';
import { AILessonCreator } from './components/teacher/AILessonCreator';
import { ApprovalWorkflow } from './components/teacher/ApprovalWorkflow';
import { QuestionBank } from './components/teacher/QuestionBank';
import { ClassAndAssignmentManager } from './components/teacher/ClassAndAssignmentManager';
import { ReportsAndAnalytics } from './components/teacher/ReportsAndAnalytics';

// Student components
import { StudentDashboard } from './components/student/StudentDashboard';

// Admin components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { RoleQuickBar } from './components/RoleQuickBar';
import { AdminLoginModal } from './components/admin/AdminLoginModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(() => storageService.getCurrentUser());
  const [users, setUsers] = useState<User[]>(() => storageService.getUsers());
  const [classes, setClasses] = useState<SchoolClass[]>(() => storageService.getClasses());
  const [materials, setMaterials] = useState<TeachingMaterial[]>(() => storageService.getMaterials());
  const [lessons, setLessons] = useState<Lesson[]>(() => storageService.getLessons());
  const [questions, setQuestions] = useState<Question[]>(() => storageService.getQuestions());
  const [assignments, setAssignments] = useState<Assignment[]>(() => storageService.getAssignments());
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>(() => storageService.getSubmissions());
  const [approvalRecords, setApprovalRecords] = useState<ApprovalRecord[]>(() => storageService.getApprovalRecords());

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<string>(() => {
    if (currentUser.role === 'STUDENT') return 'lessons';
    if (currentUser.role === 'ADMIN') return 'admin-overview';
    return 'overview';
  });

  // Modal states
  const [isSystemConfigOpen, setIsSystemConfigOpen] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isFirebaseLoginOpen, setIsFirebaseLoginOpen] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<any | null>(null);
  const [inspectingLesson, setInspectingLesson] = useState<Lesson | null>(null);
  const [preselectedMaterialForAI, setPreselectedMaterialForAI] = useState<TeachingMaterial | null>(null);

  // Sync initial demo session token and listen to Firebase Auth
  useEffect(() => {
    const current = storageService.getCurrentUser();
    if (current.role === 'ADMIN') {
      // Admin session managed via AdminLoginModal
    } else if (current.role === 'STUDENT') {
      if (!sessionStorage.getItem('demo_user_session_token')) {
        sessionStorage.setItem('demo_user_session_token', 'student_demo_token_hs_nam');
      }
    } else {
      if (!sessionStorage.getItem('demo_user_session_token')) {
        sessionStorage.setItem(
          'demo_user_session_token',
          current.username === 'gv_hung' ? 'teacher_demo_token_gv_hung' : 'teacher_demo_token_gv_mai'
        );
      }
    }

    const unsubscribe = subscribeToAuthChanges((fbUser) => {
      setFirebaseUser(fbUser);
    });
    return () => unsubscribe();
  }, []);

  // Switch role / user
  const handleSwitchUser = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser && targetUser.role === 'ADMIN' && currentUser.role !== 'ADMIN') {
      const token = sessionStorage.getItem('admin_auth_token');
      if (!token) {
        setIsAdminLoginModalOpen(true);
        return;
      }
    }

    const user = storageService.setCurrentUser(userId);
    setCurrentUser(user);

    // Sync demo session token on server for API calls
    if (user.role === 'TEACHER') {
      sessionStorage.setItem(
        'demo_user_session_token',
        user.username === 'gv_hung' ? 'teacher_demo_token_gv_hung' : 'teacher_demo_token_gv_mai'
      );
    } else if (user.role === 'STUDENT') {
      sessionStorage.setItem('demo_user_session_token', 'student_demo_token_hs_nam');
    }

    if (user.role === 'STUDENT') {
      setCurrentTab('lessons');
    } else if (user.role === 'ADMIN') {
      setCurrentTab('admin-overview');
    } else {
      setCurrentTab('overview');
    }
  };

  const handleRequestAdminLogin = () => {
    setIsAdminLoginModalOpen(true);
  };

  const handleAdminLoginSuccess = (adminPayload: any) => {
    const adminUser = users.find(u => u.role === 'ADMIN') || adminPayload;
    const user = storageService.setCurrentUser(adminUser.id);
    setCurrentUser(user);
    setCurrentTab('admin-overview');
  };

  const handleLogoutAdmin = () => {
    sessionStorage.removeItem('admin_auth_token');
    // Chuyển sang tài khoản Giáo viên Cô Mai
    const teacherUser = users.find(u => u.role === 'TEACHER') || users[1];
    const user = storageService.setCurrentUser(teacherUser.id);
    setCurrentUser(user);
    setCurrentTab('overview');
  };

  // Material operations
  const handleSaveMaterial = (material: TeachingMaterial) => {
    storageService.saveMaterial(material);
    setMaterials(storageService.getMaterials());
  };

  const handleDeleteMaterial = (id: string) => {
    storageService.deleteMaterial(id);
    setMaterials(storageService.getMaterials());
  };

  const handleNavigateToAICreator = (material: TeachingMaterial) => {
    setPreselectedMaterialForAI(material);
    setCurrentTab('ai-creator');
  };

  // Lesson operations
  const handleLessonCreated = (newLesson: Lesson) => {
    storageService.saveLesson(newLesson, currentUser, 'AI tạo bản nháp bài học mới');
    setLessons(storageService.getLessons());
    setApprovalRecords(storageService.getApprovalRecords());
  };

  const handleUpdateLessonStatus = (lessonId: string, newStatus: ContentStatus, comment?: string) => {
    storageService.updateLessonStatus(lessonId, newStatus, currentUser, comment);
    setLessons(storageService.getLessons());
    setApprovalRecords(storageService.getApprovalRecords());
    if (inspectingLesson && inspectingLesson.id === lessonId) {
      setInspectingLesson(storageService.getLessonById(lessonId) || null);
    }
  };

  // Assignment & Question operations
  const handleSaveAssignment = (assignment: Assignment) => {
    storageService.saveAssignment(assignment);
    setAssignments(storageService.getAssignments());
  };

  const handleSaveQuestion = (question: Question) => {
    storageService.saveQuestion(question);
    setQuestions(storageService.getQuestions());
  };

  const handleSaveSubmission = (submission: AssignmentSubmission) => {
    storageService.saveSubmission(submission);
    setSubmissions(storageService.getSubmissions());
  };

  const handleSaveClass = (schoolClass: SchoolClass) => {
    storageService.saveClass(schoolClass);
    setClasses(storageService.getClasses());
  };

  const handleSaveUser = (user: User) => {
    storageService.saveUser(user);
    setUsers(storageService.getUsers());
    if (user.id === currentUser.id) {
      setCurrentUser(user);
      if (user.role === 'STUDENT') {
        setCurrentTab('lessons');
      } else if (user.role === 'ADMIN') {
        setCurrentTab('admin-overview');
      } else {
        setCurrentTab('overview');
      }
    }
  };

  const handleResetData = () => {
    storageService.resetToDefault();
  };

  const studentProgress = currentUser.role === 'STUDENT' ? storageService.getProgress(currentUser.id) : undefined;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Quick Role Switcher Bar */}
      <RoleQuickBar
        currentUser={currentUser}
        users={users}
        onSwitchUser={handleSwitchUser}
        onRequestAdminLogin={handleRequestAdminLogin}
        onLogoutAdmin={handleLogoutAdmin}
        onOpenFirebaseLogin={() => setIsFirebaseLoginOpen(true)}
      />

      {/* Top Bar Header */}
      <Header
        currentUser={currentUser}
        users={users}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onSwitchUser={handleSwitchUser}
        onRequestAdminLogin={handleRequestAdminLogin}
        onOpenSystemConfig={() => setIsSystemConfigOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TEACHER ROLE VIEWS */}
        {currentUser.role === 'TEACHER' && (
          <>
            {currentTab === 'overview' && (
              <TeacherDashboard
                currentUser={currentUser}
                materials={materials}
                lessons={lessons}
                assignments={assignments}
                submissions={submissions}
                classes={classes}
                onNavigateTab={setCurrentTab}
                onOpenLesson={(l) => setInspectingLesson(l)}
              />
            )}

            {currentTab === 'materials' && (
              <MaterialManager
                currentUser={currentUser}
                materials={materials}
                onSaveMaterial={handleSaveMaterial}
                onDeleteMaterial={handleDeleteMaterial}
                onNavigateToAICreatorWithMaterial={handleNavigateToAICreator}
              />
            )}

            {currentTab === 'ai-creator' && (
              <AILessonCreator
                currentUser={currentUser}
                materials={materials}
                preselectedMaterial={preselectedMaterialForAI}
                onLessonCreated={handleLessonCreated}
                onOpenLessonPreview={(l) => setInspectingLesson(l)}
              />
            )}

            {currentTab === 'approval' && (
              <ApprovalWorkflow
                currentUser={currentUser}
                lessons={lessons}
                approvalRecords={approvalRecords}
                onOpenLesson={(l) => setInspectingLesson(l)}
                onUpdateLessonStatus={handleUpdateLessonStatus}
              />
            )}

            {currentTab === 'questions' && (
              <QuestionBank
                currentUser={currentUser}
                questions={questions}
                onSaveQuestion={handleSaveQuestion}
              />
            )}

            {currentTab === 'classes' && (
              <ClassAndAssignmentManager
                currentUser={currentUser}
                classes={classes}
                users={users}
                assignments={assignments}
                lessons={lessons}
                questions={questions}
                submissions={submissions}
                onSaveAssignment={handleSaveAssignment}
                onSaveClass={handleSaveClass}
                onSaveUser={handleSaveUser}
              />
            )}

            {currentTab === 'reports' && (
              <ReportsAndAnalytics
                currentUser={currentUser}
                classes={classes}
                users={users}
                assignments={assignments}
                submissions={submissions}
              />
            )}
          </>
        )}

        {/* STUDENT ROLE VIEWS */}
        {currentUser.role === 'STUDENT' && (
          <StudentDashboard
            currentUser={currentUser}
            lessons={lessons}
            assignments={assignments}
            submissions={submissions}
            studentProgress={studentProgress}
            activeTab={currentTab}
            onNavigateTab={setCurrentTab}
            onSaveSubmission={handleSaveSubmission}
          />
        )}

        {/* ADMIN ROLE VIEWS */}
        {currentUser.role === 'ADMIN' && (
          <>
            {currentTab === 'materials' ? (
              <MaterialManager
                currentUser={currentUser}
                materials={materials}
                onSaveMaterial={handleSaveMaterial}
                onDeleteMaterial={handleDeleteMaterial}
                onNavigateToAICreatorWithMaterial={handleNavigateToAICreator}
              />
            ) : (
              <AdminDashboard
                currentUser={currentUser}
                users={users}
                classes={classes}
                approvalRecords={approvalRecords}
                activeTab={currentTab}
                onSaveUser={handleSaveUser}
                onSaveClass={handleSaveClass}
                onOpenSystemConfig={() => setIsSystemConfigOpen(true)}
                onSwitchUser={handleSwitchUser}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <strong>TinHocTieuHoc</strong> · Hệ thống Học tập Tin học Lớp 3, 4, 5 ứng dụng AI chuẩn GDPT 2018
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSystemConfigOpen(true)}
              className="text-sky-600 hover:text-sky-800 font-medium"
            >
              Trạng thái Dịch vụ & Cấu hình Giai đoạn
            </button>
            <span aria-hidden="true">·</span>
            <span>Trường Tiểu học Ánh Dương</span>
          </div>
        </div>
      </footer>

      {/* Modal: Lesson Detail & Approval */}
      <LessonDetailModal
        lesson={inspectingLesson}
        isOpen={Boolean(inspectingLesson)}
        currentUser={currentUser}
        onClose={() => setInspectingLesson(null)}
        onUpdateStatus={handleUpdateLessonStatus}
        onStartPractice={() => {
          setInspectingLesson(null);
          setCurrentTab('practice');
        }}
      />

      {/* Modal: System Configuration & Status */}
      <SystemConfigModal
        isOpen={isSystemConfigOpen}
        onClose={() => setIsSystemConfigOpen(false)}
        onResetData={handleResetData}
      />

      {/* Modal: Admin Login with Username and Password */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Modal: Firebase Authentication Login */}
      <FirebaseLoginModal
        isOpen={isFirebaseLoginOpen}
        onClose={() => setIsFirebaseLoginOpen(false)}
        onLoginSuccess={(fbUser) => {
          setFirebaseUser(fbUser);
        }}
      />

    </div>
  );
}
