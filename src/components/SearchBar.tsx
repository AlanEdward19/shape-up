
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { SocialService } from "@/services/api";
import { ProfileSearchResult } from "@/types/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import debounce from "lodash/debounce";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<ProfileSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const performSearch = async (name: string) => {
    if (!name.trim()) {
      setResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await SocialService.searchProfileByName(name);
      setResults(response);
    } catch (error) {
      console.error("Error searching profiles:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = debounce(performSearch, 2000);

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Pesquisar perfis..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-secondary/50 border-none pl-10 rounded-full focus:ring-primary"
        />
      </div>

      {(results.length > 0 || isSearching) && (
        <div className="absolute top-full mt-2 w-[calc(100vw-2rem)] sm:w-full bg-background border rounded-lg shadow-lg z-50 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-0">
          {isSearching ? (
            <div className="p-4 text-center text-muted-foreground">
              Pesquisando...
            </div>
          ) : (
            <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto">
              {results.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => {
                    navigate(`/profile/${profile.id}`);
                    setSearchTerm("");
                    setResults([]);
                  }}
                >
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                    <AvatarImage src={profile.imageUrl} />
                    <AvatarFallback>
                      {profile.firstName[0]}
                      {profile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm sm:text-base">
                      {profile.firstName} {profile.lastName}
                    </span>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Ver perfil
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
