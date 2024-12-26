import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SocialService } from "@/services/api";
import { Gender } from "@/types/api";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Profile = () => {
  const { id } = useParams();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => SocialService.getFriendRecommendations().then(
      recommendations => recommendations.find(r => r.profile.id === id)?.profile
    ),
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch profile:', error);
        toast.error("Falha ao carregar perfil. Tente novamente mais tarde.");
      }
    }
  });

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!profile) {
    return <div>Perfil não encontrado</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <img
            src={profile.imageUrl}
            alt={`${profile.firstName} ${profile.lastName}`}
            className="w-24 h-24 rounded-full object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold">
              {profile.firstName} {profile.lastName}
            </h1>
            <p className="text-muted-foreground">{profile.email}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;