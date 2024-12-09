import UserEditPage from "@/components/profile";
import LogoHeader from "@/components/logosHeader";
import NavigationBar from "@/components/navigationBar";

export default function Profile() {
  return (
    <div className="flex flex-col w-[100%] h-[100%]">
      <LogoHeader />
      <NavigationBar />
      <UserEditPage />
    </div>
  );
}
