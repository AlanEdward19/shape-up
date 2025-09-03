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

    const handleCarouselClick = (e: React.MouseEvent) => {
        // Stop event propagation if clicking on carousel controls
        if (
            e.target instanceof Element &&
            (e.target.closest('button') ||
                e.target.closest('[data-carousel-button]'))
        ) {
            e.stopPropagation();
        }
    };

    const videoExtensions = ['.mp4', '.webm', '.mov', '.ogg'];

    const isVideo = (url: string) => {
        const cleanUrl = url.split('?')[0].split('#')[0];
        return videoExtensions.some(ext => cleanUrl.toLowerCase().endsWith(ext));
    };

    return (
        <div className="mb-4 rounded-lg overflow-hidden relative" onClick={handleCarouselClick}>
            <Carousel className="w-full">
                <CarouselContent>
                    {media.map((url, index) => (
                        <CarouselItem key={index}>
                            {isVideo(url) ? (
                                <video
                                    src={url}
                                    controls
                                    width="100%"
                                    height="auto"
                                    poster="/placeholder.svg"
                                    className="w-full h-auto bg-black"
                                    onError={(e) => {
                                        e.currentTarget.src = '/placeholder.svg';
                                    }}
                                >
                                    Seu navegador não suporta a reprodução de vídeo.
                                </video>
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
                        <CarouselPrevious className="left-2" data-carousel-button />
                        <CarouselNext className="right-2" data-carousel-button />
                    </>
                )}
            </Carousel>
        </div>
    );
};

export default PostMedia;