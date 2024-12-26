import { ViewProfileResponse, Gender } from "@/types/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProfileInfoProps {
  profile: ViewProfileResponse;
}

const ProfileInfo = ({ profile }: ProfileInfoProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold mb-2">Sobre</h2>
        <p>{profile.bio}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="font-semibold mb-2">Informações Pessoais</h2>
          <ul className="space-y-2">
            <li>
              <span className="text-muted-foreground">Gênero:</span>{" "}
              {profile.gender === Gender.Male ? "Masculino" : "Feminino"}
            </li>
            <li>
              <span className="text-muted-foreground">Data de Nascimento:</span>{" "}
              {format(new Date(profile.birthDate), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </li>
          </ul>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Localização</h2>
          <ul className="space-y-2">
            <li>
              <span className="text-muted-foreground">Cidade:</span>{" "}
              {profile.city}
            </li>
            <li>
              <span className="text-muted-foreground">Estado:</span>{" "}
              {profile.state}
            </li>
            <li>
              <span className="text-muted-foreground">País:</span>{" "}
              {profile.country}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;