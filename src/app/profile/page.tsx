import UserEditPage from "@/components/profile";
import LogoHeader from "@/components/logosHeader";
import NavigationBar from "@/components/navigationBar";
import SiteFooter from "@/components/siteFooter";

export default function Profile() {
  return (
    <div className="flex flex-col w-[100%] h-[100%]">
      <LogoHeader />
      <NavigationBar />
      <UserEditPage />
      <SiteFooter />
    </div>
  );
}
