import ForgotPasswordForm from "../components/auth/ForgotPasswordForm.jsx";
import LoginForm from "../components/auth/LoginForm.jsx";
import RegisterForm from "../components/auth/RegisterForm.jsx";
import { Activity } from "lucide-react";

export default function AuthPage({ mode }) {
  return (
    <section className="min-h-screen flex flex-col lg:grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-primary-800 to-teal-600 text-white p-12">
        <Activity size={80} className="mb-8 opacity-90" />
        <h1 className="text-5xl font-bold mb-4 tracking-tight">SmileCare</h1>
        <p className="text-xl text-primary-100 text-center max-w-md">
          Hệ thống quản lý phòng khám nha khoa hiện đại, tận tâm và chuyên nghiệp.
        </p>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {mode === "register" ? <RegisterForm /> : mode === "forgot" ? <ForgotPasswordForm /> : <LoginForm />}
        </div>
      </div>
    </section>
  );
}
