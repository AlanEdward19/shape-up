import NavigationItems from "@/components/molecules/sidebar/NavigationItems";
import BottomItems from "@/components/molecules/sidebar/BottomItems";

const Sidebar = () => {
  return (
    <div className="fixed left-0 top-0 h-screen w-20 bg-secondary flex flex-col items-center justify-between py-6">
      <NavigationItems />
      <BottomItems />
    </div>
  );
};

export default Sidebar;