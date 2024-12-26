import { FollowUser } from "@/types/api";
import { useNavigate } from "react-router-dom";

interface FollowListProps {
  users?: FollowUser[];
  isLoading: boolean;
  title: string;
}

const FollowList = ({ users, isLoading, title }: FollowListProps) => {
  const navigate = useNavigate();

  if (isLoading) return <div>Carregando...</div>;
  if (!users) return null;

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div
          key={user.profileId}
          className="flex items-center space-x-4 p-2 hover:bg-secondary/50 rounded-lg cursor-pointer"
          onClick={() => navigate(`/profile/${user.profileId}`)}
        >
          <img
            src={user.imageUrl}
            alt={`${user.firstName} ${user.lastName}`}
            className="w-12 h-12 rounded-full object-cover"
          />
          <span className="font-medium">
            {user.firstName} {user.lastName}
          </span>
        </div>
      ))}
    </div>
  );
};

export default FollowList;