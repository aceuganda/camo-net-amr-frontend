import NavigationBar from "@/components/navigationBar";
import HomePage from "@/components/homePage";

export default function Home() {
  return (
    <div className="flex flex-col w-[100%] h-[100%]">
      <NavigationBar/>
      <HomePage/>
    </div>
  );
}
