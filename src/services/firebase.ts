/**
 * Firebase Client SDK Initialization & Authentication Service
 * Hỗ trợ xác thực đa chế độ: Firebase Authentication thực tế & Chế độ Demo Sư phạm
 */
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  getIdToken,
  createUserWithEmailAndPassword
} from 'firebase/auth';

// 1. Kiểm tra cấu hình Firebase từ biến môi trường Vite (VITE_FIREBASE_*)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey && 
    firebaseConfig.authDomain && 
    firebaseConfig.projectId
  );
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (err) {
    console.warn('[Firebase Client] Lỗi khi khởi tạo Firebase Client SDK:', err);
  }
} else {
  // Ghi log trạng thái rõ ràng, không giả định đã kết nối
  console.info('[Firebase Client] Chưa phát hiện cấu hình VITE_FIREBASE_* trong .env. Ứng dụng sẵn sàng ở Chế độ Demo Sư phạm.');
}

export { app, auth };

/**
 * Lấy Bearer Token hiện tại của phiên đăng nhập để gửi tới Express Backend
 * - Nếu dùng Firebase Auth: lấy ID Token JWT đã ký của Firebase
 * - Nếu ở chế độ Demo: lấy session token từ sessionStorage
 */
export async function getCurrentBearerToken(): Promise<string | null> {
  if (auth && auth.currentUser) {
    try {
      return await getIdToken(auth.currentUser, false);
    } catch (err) {
      console.warn('Lỗi khi lấy Firebase ID Token:', err);
    }
  }

  // Fallback sang token phiên Demo (nếu có)
  const adminToken = sessionStorage.getItem('admin_auth_token');
  if (adminToken) {
    return adminToken;
  }

  const demoUserSession = sessionStorage.getItem('demo_user_session_token');
  if (demoUserSession) {
    return demoUserSession;
  }

  return null;
}

/**
 * Đăng nhập qua Firebase Authentication
 */
export async function loginWithFirebase(email: string, pass: string): Promise<{
  success: boolean;
  user?: FirebaseUser;
  token?: string;
  error?: string;
}> {
  if (!auth) {
    return {
      success: false,
      error: 'Firebase Authentication chưa được kích hoạt hoặc chưa cấu hình biến môi trường VITE_FIREBASE_* trong tệp .env.',
    };
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const token = await cred.user.getIdToken();
    return {
      success: true,
      user: cred.user,
      token,
    };
  } catch (err: any) {
    let friendlyMessage = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
    if (err.code === 'auth/configuration-not-found') {
      friendlyMessage = 'Dự án Firebase chưa được kích hoạt Authentication trên Firebase Console. Thầy/Cô vui lòng vào Firebase Console > Build > Authentication > nhấn "Get started" và bật phương thức Email/Password.';
    } else if (err.code === 'auth/operation-not-allowed') {
      friendlyMessage = 'Phương thức đăng nhập Email/Password chưa được kích hoạt trong Firebase Console. Vui lòng vào Build > Authentication > Sign-in method và Bật (Enable) Email/Password.';
    } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
      friendlyMessage = 'Email hoặc mật khẩu không chính xác. Thầy cô vui lòng kiểm tra lại.';
    } else if (err.code === 'auth/too-many-requests') {
      friendlyMessage = 'Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau ít phút để bảo vệ tài khoản.';
    } else if (err.code === 'auth/network-request-failed') {
      friendlyMessage = 'Không thể kết nối đến máy chủ xác thực Firebase. Vui lòng kiểm tra đường truyền mạng.';
    }
    return {
      success: false,
      error: friendlyMessage,
    };
  }
}

/**
 * Đăng ký tài khoản mới qua Firebase Authentication
 */
export async function registerWithFirebase(email: string, pass: string): Promise<{
  success: boolean;
  user?: FirebaseUser;
  token?: string;
  error?: string;
}> {
  if (!auth) {
    return {
      success: false,
      error: 'Firebase Authentication chưa được kích hoạt hoặc chưa cấu hình biến môi trường VITE_FIREBASE_* trong tệp .env.',
    };
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const token = await cred.user.getIdToken();
    return {
      success: true,
      user: cred.user,
      token,
    };
  } catch (err: any) {
    let friendlyMessage = 'Đăng ký tài khoản thất bại. Vui lòng thử lại.';
    if (err.code === 'auth/configuration-not-found') {
      friendlyMessage = 'Dự án Firebase chưa được kích hoạt Authentication trên Firebase Console. Thầy/Cô vui lòng vào Firebase Console > Build > Authentication > nhấn "Get started" và bật phương thức Email/Password.';
    } else if (err.code === 'auth/operation-not-allowed') {
      friendlyMessage = 'Phương thức đăng nhập Email/Password chưa được kích hoạt trong Firebase Console. Vui lòng vào Build > Authentication > Sign-in method và Bật (Enable) Email/Password.';
    } else if (err.code === 'auth/email-already-in-use') {
      friendlyMessage = 'Email này đã được sử dụng. Thầy cô vui lòng chuyển sang tab Đăng nhập hoặc sử dụng email khác.';
    } else if (err.code === 'auth/weak-password') {
      friendlyMessage = 'Mật khẩu quá yếu. Vui lòng đặt mật khẩu tối thiểu 6 ký tự.';
    } else if (err.code === 'auth/invalid-email') {
      friendlyMessage = 'Địa chỉ email không đúng định dạng. Vui lòng kiểm tra lại.';
    }
    return {
      success: false,
      error: friendlyMessage,
    };
  }
}

/**
 * Đăng xuất tài khoản
 */
export async function logoutUser(): Promise<void> {
  if (auth && auth.currentUser) {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn('Lỗi đăng xuất Firebase:', err);
    }
  }
  sessionStorage.removeItem('admin_auth_token');
  sessionStorage.removeItem('demo_user_session_token');
}

/**
 * Lắng nghe thay đổi trạng thái xác thực Firebase
 */
export function subscribeToAuthChanges(callback: (user: FirebaseUser | null) => void) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
