import { ViewProfileResponse, Gender } from "@/types/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MapPin, Briefcase, GraduationCap, Heart } from "lucide-react";

interface ProfileInfoProps {
  profile: ViewProfileResponse;
}

const ProfileInfo = ({ profile }: ProfileInfoProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold mb-4 text-lg">Sobre</h2>
        <p className="text-muted-foreground">{profile.bio}</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-muted-foreground" />
          <span>
            Mora em <span className="font-medium">{profile.city}, {profile.state}, {profile.country}</span>
          </span>
        </div>

        {profile.gender === Gender.Male ? (
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-muted-foreground" />
            <span>Homem</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-muted-foreground" />
            <span>Mulher</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-muted-foreground" />
          <span>
            Nascido em{" "}
            <span className="font-medium">
              {format(new Date(profile.birthDate), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;