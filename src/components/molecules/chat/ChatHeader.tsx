import { useNavigate } from "react-router-dom";

interface ChatHeaderProps {
  profileId: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
}

const ChatHeader = ({ profileId, firstName, lastName, imageUrl }: ChatHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div 
      className="p-4 border-b flex items-center gap-3 cursor-pointer hover:bg-secondary/50"
      onClick={() => navigate(`/profile/${profileId}`)}
    >
      <div className="w-10 h-10 rounded-full bg-primary/20">
        {imageUrl && <img src={imageUrl} alt={firstName} className="w-full h-full rounded-full object-cover" />}
      </div>
      <span className="font-medium">{`${firstName} ${lastName}`}</span>
    </div>
  );
};

export default ChatHeader;