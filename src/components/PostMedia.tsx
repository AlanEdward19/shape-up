import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface PostMediaProps {
  media: string[];
}

const PostMedia = ({ media }: PostMediaProps) => {
  if (!media || media.length === 0) return null;

  return (
    <div className="mb-4 rounded-lg overflow-hidden relative">
      <Carousel className="w-full">
        <CarouselContent>
          {media.map((url, index) => (
            <CarouselItem key={index}>
              {url.toLowerCase().endsWith('.mp4') ? (
                <video 
                  src={url} 
                  controls 
                  className="w-full h-auto"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              ) : (
                <img 
                  src={url} 
                  alt={`Post content ${index + 1}`} 
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
        {media.length > 1 && (
          <>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </>
        )}
      </Carousel>
    </div>
  );
};

export default PostMedia;