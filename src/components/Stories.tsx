import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const profiles = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Perfil ${i + 1}`,
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
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent p-[2px]">
                  <div className="w-full h-full rounded-full bg-secondary"></div>
                </div>
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