import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MapPin, Calendar, Heart } from "lucide-react";
import FriendRequestManagement from "./friend-actions/FriendRequestManagement";
import {Gender, ViewProfileResponse} from "@/types/socialService.ts";

interface ProfileInfoProps {
  profile: ViewProfileResponse;
  hasReceivedRequest?: boolean;
}

const ProfileInfo = ({ 
  profile,
  hasReceivedRequest = false,
}: ProfileInfoProps) => {
  return (
    <div className="space-y-3 md:space-y-6">
      <div>
        {profile.bio && (
          <p className="text-xs md:text-muted-foreground md:text-base mb-2 md:mb-6 leading-tight md:leading-normal">{profile.bio}</p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          <div className="flex items-center gap-1 md:gap-2 text-xs md:text-base">
            <MapPin className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
            <span>
              Mora em <span className="font-medium">{profile.country}, {profile.city}-{profile.state}</span>
            </span>
          </div>

          {profile.birthDate != null && (
            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-base">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
              <span>
                Nascido em{" "}
                <span className="font-medium">
                  {format(new Date(profile.birthDate), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </span>
              </span>
            </div>
          )}

          {profile.gender != null && (
            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-base">
              <Heart className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
              <span className="font-medium">
                {profile.gender === Gender.Male ? "Homem" : "Mulher"}
              </span>
            </div>
          )}
        </div>
      </div>

      <FriendRequestManagement
        profileId={profile.id}
        hasReceivedRequest={hasReceivedRequest}
      />
    </div>
  );
};

export default ProfileInfo;