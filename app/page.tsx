import Image from "next/image";
import LoginComponent from '@/components/login-form'
import BgAnimation from '@/components/bg-animation'

export default function Home() {
  return (
    <div className="flex justify-center items-center h-screen relative">
      <BgAnimation></BgAnimation>

      <LoginComponent></LoginComponent>
    </div>
  );
}
