import { Avatar as ShadcnAvatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface AvatarProps {
  imageUrl?: string;
  firstName?: string;
  lastName?: string;
  className?: string;
}

const Avatar = ({ imageUrl, firstName, lastName, className }: AvatarProps) => {
  const initials = firstName && lastName ? `${firstName[0]}${lastName[0]}` : "U";

  return (
    <ShadcnAvatar className={className}>
      <AvatarImage src={imageUrl} alt={firstName && lastName ? `${firstName} ${lastName}` : ""} />
      <AvatarFallback>{initials}</AvatarFallback>
    </ShadcnAvatar>
  );
};

export default Avatar;