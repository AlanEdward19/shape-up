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
        <div className="mb-4" onClick={handleCarouselClick}>
            <Carousel className="w-full">
                <CarouselContent>
                    {media.map((url, index) => (
                        <CarouselItem key={index}>
                            {isVideo(url) ? (
                                <div className="aspect-[4/3] w-full h-full flex items-center justify-center bg-black rounded-lg overflow-hidden">
                                    <video
                                        src={url}
                                        controls
                                        width="100%"
                                        height="100%"
                                        preload="auto"
                                        className="w-full h-full object-cover bg-black"
                                        onError={(e) => {
                                            e.currentTarget.src = '/placeholder.svg';
                                        }}
                                    >
                                        Seu navegador não suporta a reprodução de vídeo.
                                    </video>
                                </div>
                            ) : (
                                (() => {
                                    const transparentExtensions = ['.png', '.svg'];
                                    const isTransparent = transparentExtensions.some(ext => url.split('?')[0].split('#')[0].toLowerCase().endsWith(ext));
                                    return (
                                        <div className="aspect-[4/3] w-full h-full flex items-center justify-center rounded-lg overflow-hidden">
                                            <img
                                                src={url}
                                                alt={`Post content ${index + 1}`}
                                                className={`w-full h-full ${isTransparent ? 'object-contain' : 'object-cover'}`}
                                                onError={(e) => {
                                                    e.currentTarget.src = '/placeholder.svg';
                                                }}
                                            />
                                        </div>
                                    );
                                })()
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