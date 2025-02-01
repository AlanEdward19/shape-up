import NavigationItems from "./NavigationItems";
import BottomItems from "./BottomItems";

const Sidebar = () => {
  return (
    <div className="fixed left-0 top-0 h-screen w-20 bg-secondary flex flex-col items-center justify-between py-6">
      <NavigationItems />
      <BottomItems />
    </div>
  );
};

export default Sidebar;
