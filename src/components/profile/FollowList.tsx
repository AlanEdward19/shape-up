import { FollowUser } from "@/types/api";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface FollowListProps {
  users?: FollowUser[];
  isLoading: boolean;
  title: string;
}

const FollowList = ({ users, isLoading, title }: FollowListProps) => {
  const navigate = useNavigate();
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  if (isLoading) return <div>Carregando...</div>;
  if (!users) return null;

  const totalUsers = users.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          Página {currentPage} • {totalUsers} {title.toLowerCase()}
        </div>
        <Select
          value={itemsPerPage}
          onValueChange={(value) => {
            setItemsPerPage(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Linhas por página" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 por página</SelectItem>
            <SelectItem value="10">10 por página</SelectItem>
            <SelectItem value="20">20 por página</SelectItem>
            <SelectItem value="50">50 por página</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[300px]">
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
      </ScrollArea>
    </div>
  );
};

export default FollowList;