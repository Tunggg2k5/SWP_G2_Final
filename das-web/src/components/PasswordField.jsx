import { Input } from "antd";

export default function PasswordField({ value, onChange, className = "", ...props }) {
  return (
    <Input.Password
      {...props}
      value={value}
      onChange={onChange}
      className={`h-[42px] rounded-xl border-slate-200 hover:border-primary-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all ${className}`}
    />
  );
}
