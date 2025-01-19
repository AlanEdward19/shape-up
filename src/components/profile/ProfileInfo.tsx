import { ViewProfileResponse, Gender } from "@/types/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MapPin, Calendar, Heart } from "lucide-react";

interface ProfileInfoProps {
  profile: ViewProfileResponse;
}

const ProfileInfo = ({ profile }: ProfileInfoProps) => {
  return (
    <div className="space-y-6">
      {profile.bio && (
        <p className="text-muted-foreground mb-6">{profile.bio}</p>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-muted-foreground" />
          <span>
            Mora em <span className="font-medium">{profile.city}, {profile.state}, {profile.country}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <span>
            Nascido em{" "}
            <span className="font-medium">
              {format(new Date(profile.birthDate), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium">
            {profile.gender === Gender.Male ? "Homem" : "Mulher"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;