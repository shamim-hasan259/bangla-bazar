import { Eye, EyeOff } from "lucide-react";

const PasswordShowClose = ({ eyeOpen, setEyeOpen }: any) => {
  return (
    <span
      onClick={() => setEyeOpen(!eyeOpen)}
      className="absolute top-2 right-2"
    >
      {eyeOpen ? <Eye size={22} /> : <EyeOff size={22} />}
    </span>
  );
};

export default PasswordShowClose;
