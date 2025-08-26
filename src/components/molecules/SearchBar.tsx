import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { SocialService } from "@/services/socialService.ts";
import { ProfileSearchResult } from "@/types/socialService.ts";
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
    }, [searchTerm, debouncedSearch]);

    return (
        <div className="relative w-full max-w-md">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70 text-[#8b93a7]" size={18} />
                <Input
                    className="pl-10 pr-4 py-2 rounded-xl bg-[#161b28] border border-[#222737] text-[#e8ecf8] outline-none shadow focus:border-[#6ea8fe] transition-colors"
                    placeholder="Buscar perfis..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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