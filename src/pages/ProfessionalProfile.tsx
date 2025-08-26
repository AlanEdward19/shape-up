import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Avatar from '../components/atoms/Avatar';
import Button from '../components/atoms/Button';
import { ProfessionalManagementService, getProfessionalProfile } from '../services/professionalManagementService';
import { professionalResponse, servicePlanResponse, clientProfessionalReviewResponse } from '../types/professionalManagementService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState<number>(0);
  const [editComment, setEditComment] = useState<string>('');
  const [loadingReviewAction, setLoadingReviewAction] = useState(false);
  const [errorReviewAction, setErrorReviewAction] = useState<string | null>(null);
  const [showDeleteReviewModal, setShowDeleteReviewModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const refreshProfile = async () => {
    setLoading(true);
    const data = await getProfessionalProfile(id, user);
    setProfessional(data.professional);
    setHasActiveContract(data.hasActiveContract);
    setLoading(false);
  };

  const handleEditClick = (review: any) => {
    setEditingReviewId(review.id);
    setEditRating(review.score);
    setEditComment(review.text);
    setErrorReviewAction(null);
  };

  const handleEditSave = async () => {
    if (!editingReviewId) return;
    setLoadingReviewAction(true);
    setErrorReviewAction(null);
    try {
      await ProfessionalManagementService.updateProfessionalReview(editingReviewId, {
        rating: editRating,
        comment: editComment
      });
      setEditingReviewId(null);
      await refreshProfile();
    } catch (err: any) {
      setErrorReviewAction('Erro ao editar avaliação.');
    }
    setLoadingReviewAction(false);
  };

  const handleEditCancel = () => {
    setEditingReviewId(null);
    setErrorReviewAction(null);
  };

  const handleDeleteReview = (review: any) => {
    setReviewToDelete(review);
    setShowDeleteReviewModal(true);
    setDeleteError(null);
  };

  const handleConfirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await ProfessionalManagementService.deleteProfessionalReview(reviewToDelete.id);
      setShowDeleteReviewModal(false);
      setReviewToDelete(null);
      await refreshProfile();
    } catch (err: any) {
      setDeleteError('Erro ao excluir avaliação.');
    }
    setDeleteLoading(false);
  };

  const handleCancelDeleteReview = () => {
    setShowDeleteReviewModal(false);
    setReviewToDelete(null);
    setDeleteError(null);
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
                const isEditing = editingReviewId === f.id;
                return (
                  <div key={f.id || idx} className="bg-[#12182a] border border-[#23283a] rounded-xl p-4 shadow">
                    <div className="flex justify-between items-center">
                      <div className="font-semibold">{f.by}</div>
                      <div className="pill px-3 py-1 rounded-full border border-[#222737] bg-[#1b2233] text-xs">Nota: {f.score}</div>
                    </div>
                    {isEditing ? (
                      <div className="mt-2">
                        <div className="flex gap-2 items-center mb-2">
                          <label className="text-xs">Nota:</label>
                          <input type="number" min={1} max={5} value={editRating} onChange={e => setEditRating(Number(e.target.value))} className="w-16 px-2 py-1 rounded bg-[#23283a] text-[#e8ecf8] border border-[#222737] text-sm" />
                        </div>
                        <textarea value={editComment} onChange={e => setEditComment(e.target.value)} className="w-full px-2 py-1 rounded bg-[#23283a] text-[#e8ecf8] border border-[#222737] text-sm mb-2" rows={2} />
                        {errorReviewAction && <div className="text-red-500 text-xs mb-2">{errorReviewAction}</div>}
                        <div className="flex gap-2">
                          <Button style={{ height: '24px', minHeight: '24px', paddingTop: 0, paddingBottom: 0 }} className="btn px-3 rounded bg-[#6ea8fe] text-[#0b1222] text-sm" onClick={handleEditSave} disabled={loadingReviewAction}>Salvar</Button>
                          <Button style={{ height: '24px', minHeight: '24px', paddingTop: 0, paddingBottom: 0 }} className="btn px-3 rounded bg-[#e85d75] text-[#fff] text-sm" onClick={handleEditCancel} disabled={loadingReviewAction}>Cancelar</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="muted mt-2">{f.text}</p>
                        <div className="muted mt-1 text-xs">Última atualização: {formatDate(f.updated)}</div>
                        {isOwnReview && (
                          <div className="flex gap-2 mt-2">
                            <Button
                              style={{ height: '24px', minHeight: '24px', paddingTop: 0, paddingBottom: 0 }}
                              className="btn px-3 rounded bg-[#6ea8fe] text-[#0b1222] text-sm"
                              onClick={() => handleEditClick(f)}
                              disabled={loadingReviewAction}
                            >Editar</Button>
                            <Button
                              style={{ height: '24px', minHeight: '24px', paddingTop: 0, paddingBottom: 0 }}
                              className="btn px-3 rounded bg-[#e85d75] text-[#fff] text-sm"
                              onClick={() => handleDeleteReview(f)}
                              disabled={loadingReviewAction}
                            >Excluir</Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
        {/* Modal de confirmação de exclusão de review */}
        <Dialog open={showDeleteReviewModal} onOpenChange={setShowDeleteReviewModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
            </DialogHeader>
            <div className="py-4 text-center text-[#8b93a7]">
              Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.
            </div>
            {deleteError && <div className="text-red-500 text-sm mb-2">{deleteError}</div>}
            <div className="flex justify-center gap-2">
              <Button
                className="btn px-4 py-2 rounded-lg border border-[#222737] text-[#e8ecf8] bg-transparent"
                onClick={handleCancelDeleteReview}
                disabled={deleteLoading}
              >Cancelar</Button>
              <Button
                className="btn danger px-4 py-2 rounded-lg border border-[#ff5d6c] text-[#ffc7cd] bg-[#2b3347]"
                onClick={handleConfirmDeleteReview}
                disabled={deleteLoading}
              >{deleteLoading ? "Excluindo..." : "Excluir avaliação"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ProfessionalProfile;
