import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Avatar from "@/components/atoms/Avatar";

const profiles = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Perfil ${i + 1}`,
  imageUrl: `https://randomuser.me/api/portraits/men/${i + 1}.jpg`, // Example image URL
}));

const Stories = () => {
  return (
    <div className="mb-6">
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 flex">
          {profiles.map((profile) => (
            <CarouselItem key={profile.id} className="pl-2 basis-[100px] min-w-[100px]">
              <div className="flex flex-col items-center gap-1 cursor-pointer">
                <Avatar imageUrl={profile.imageUrl} firstName={profile.name.split(" ")[0]} lastName={profile.name.split(" ")[1]} />
                <span className="text-sm text-muted-foreground truncate w-full text-center">
                  {profile.name}
                </span>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default Stories;
