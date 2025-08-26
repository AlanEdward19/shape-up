import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Avatar from '../components/atoms/Avatar';
import Button from '../components/atoms/Button';
import { ProfessionalManagementService, getProfessionalProfile } from '../services/professionalManagementService';
import { professionalResponse, servicePlanResponse, clientProfessionalReviewResponse } from '../types/professionalManagementService';

const ProfessionalProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;
  const [professional, setProfessional] = useState<{
    id: string;
    name: string;
    avatar: string;
    rating: number;
    reviews: number;
    tags: string[];
    plans: servicePlanResponse[];
    feedbacks: {
      by: string;
      score: number;
      text: string;
      updated: string;
    }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasActiveContract, setHasActiveContract] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const data = await getProfessionalProfile(id, user);
      setProfessional(data.professional);
      setHasActiveContract(data.hasActiveContract);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  // Helper to format date as yyyy-MM-dd
  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toISOString().slice(0, 10);
  }

  const getServiceTypeLabel = (type: number) => {
    switch(type) {
      case 0: return 'Treino';
      case 1: return 'Dieta';
      default: return 'Outro';
    }
  };

  if (loading || !professional) return <div className="text-center py-12 text-[#8b93a7]">Carregando dados...</div>;

  return (
    <div className="min-h-screen w-full bg-[#0f1420] text-[#e8ecf8]" style={{
      background: "radial-gradient(1200px 600px at 10% -10%, #1b2437 0, transparent 60%), #0f1420"
    }}>
      <main className="container mx-auto max-w-3xl px-4 py-8">
        {/* Cabeçalho do perfil */}
        <section className="bg-[#161b28] border border-[#222737] rounded-[14px] p-5 shadow mb-6">
          <div className="flex gap-5 items-center flex-wrap">
            <Avatar imageUrl={professional.avatar} firstName={professional.name.split(' ')[0]} lastName={professional.name.split(' ')[1] || ''} className="w-16 h-16" />
            <div>
              <h1 className="text-xl font-bold mb-1">{professional.name}</h1>
              <div className="muted">Avaliação: <span className="stars">★</span> {professional.rating?.toFixed(1)} (<span>{professional.reviews}</span> review{professional.reviews !== 1 ? 's' : ''})</div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {professional.tags?.map((tag: string) => (
                  <span key={tag} className="tag px-3 py-1 rounded-full bg-[#1b2233] border border-[#222737] text-xs">{tag}</span>
                ))}
              </div>
            </div>
            <div style={{flex:1}}></div>
            <div>
              <Button disabled={!hasActiveContract} title={!hasActiveContract ? 'Disponível quando houver um plano ativo' : ''} className={hasActiveContract ? 'btn primary px-4 py-2 rounded-lg border-none bg-gradient-to-br from-[#6ea8fe] to-[#7ef0c1] text-[#0b1222]' : 'btn px-4 py-2 rounded-lg border border-[#222737] text-[#e8ecf8] bg-transparent'}>💬 Chat</Button>
            </div>
          </div>
        </section>

          {/* Planos disponíveis */}
        <section className="bg-[#161b28] border border-[#222737] rounded-[14px] p-5 shadow mb-6">
          <h2 className="text-base font-semibold mb-2">Planos Disponíveis</h2>
          <div className="grid gap-4">
            {professional.plans?.length === 0 ? (
              <div className="text-center text-[#8b93a7] py-4">Nenhum plano disponível.</div>
            ) : (
              professional.plans?.map((p: servicePlanResponse) => {
                const isContracted = user?.clientServicePlans?.some(plan => plan.status === 0 && plan.servicePlan.id === p.id);
                return (
                  <div key={p.id} className="flex justify-between items-center bg-[#12182a] border border-[#23283a] rounded-xl p-4 shadow">
                    <div>
                      <div className="font-semibold">{p.title}</div>
                      <div className="muted">Duração: {p.durationInDays} dias • Preço: R$ {p.price.toFixed(2).replace('.', ',')} • Tipo: {getServiceTypeLabel(p.type)}</div>
                    </div>
                    <div>
                      <Button
                        disabled={isContracted}
                        className={isContracted ? 'btn px-4 py-2 rounded-lg border border-[#222737] text-[#e8ecf8] bg-transparent' : 'btn primary px-4 py-2 rounded-lg border-none bg-gradient-to-br from-[#6ea8fe] to-[#7ef0c1] text-[#0b1222]'}
                      >
                        {isContracted ? 'Já contratado' : 'Contratar'}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
        {/* Avaliações */}
        <section className="bg-[#161b28] border border-[#222737] rounded-[14px] p-5 shadow">
          <h2 className="text-base font-semibold mb-2">Avaliações</h2>
          <div className="grid gap-4">
            {professional.feedbacks?.length === 0 ? (
              <div className="text-center text-[#8b93a7] py-4">Nenhuma avaliação encontrada.</div>
            ) : (
              professional.feedbacks?.map((f: any, idx: number) => {
                const isOwnReview = user && f.by === user.name;
                return (
                  <div key={idx} className="bg-[#12182a] border border-[#23283a] rounded-xl p-4 shadow">
                    <div className="flex justify-between items-center">
                      <div className="font-semibold">{f.by}</div>
                      <div className="pill px-3 py-1 rounded-full border border-[#222737] bg-[#1b2233] text-xs">Nota: {f.score}</div>
                    </div>
                    <p className="muted mt-2">{f.text}</p>
                    <div className="muted mt-1 text-xs">Última atualização: {formatDate(f.updated)}</div>
                    {isOwnReview && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          style={{ height: '24px', minHeight: '24px', paddingTop: 0, paddingBottom: 0 }}
                          className="btn px-3 rounded bg-[#6ea8fe] text-[#0b1222] text-sm"
                          onClick={() => alert('Editar review não implementado')}
                        >Editar</Button>
                        <Button
                          style={{ height: '24px', minHeight: '24px', paddingTop: 0, paddingBottom: 0 }}
                          className="btn px-3 rounded bg-[#e85d75] text-[#fff] text-sm"
                          onClick={() => alert('Excluir review não implementado')}
                        >Excluir</Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProfessionalProfile;
