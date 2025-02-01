import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface FollowListProps {
  users?: FollowUser[];
  isLoading: boolean;
  title: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  onRowsChange: (rows: string) => void;
  totalUsers: number;
}

const FollowList = ({ 
  users, 
  isLoading, 
  title,
  currentPage,
  onPageChange,
  onRowsChange,
  totalUsers 
}: FollowListProps) => {
  const navigate = useNavigate();
  const [itemsPerPage, setItemsPerPage] = useState("10");

  if (isLoading) return <div>Carregando...</div>;
  if (!users) return null;

  const handleRowsChange = (value: string) => {
    setItemsPerPage(value);
    onRowsChange(value);
  };

  const totalPages = Math.ceil(totalUsers / Number(itemsPerPage));
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          Página {currentPage} • {totalUsers} {title.toLowerCase()}
        </div>
        <Select
          value={itemsPerPage}
          onValueChange={handleRowsChange}
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
              <Avatar className="w-10 h-10">
                  <AvatarImage src={user.imageUrl} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                </Avatar>
              <span className="font-medium">
                {user.firstName} {user.lastName}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {hasPreviousPage && (
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => onPageChange(currentPage - 1)}
                  className="cursor-pointer"
                />
              </PaginationItem>
            )}
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => onPageChange(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            {hasNextPage && (
              <PaginationItem>
                <PaginationNext 
                  onClick={() => onPageChange(currentPage + 1)}
                  className="cursor-pointer"
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default FollowList;
