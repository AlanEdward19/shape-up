import React, { useEffect, useState } from "react";
import { ProfessionalManagementService } from "@/services/professionalManagementService";
import { SocialService } from "@/services/socialService";
import { clientResponse, professionalResponse, servicePlanResponse, clientServicePlanResponse, clientProfessionalReviewResponse, professionalScoreResponse } from "@/types/professionalManagementService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

const ProfessionalsHub: React.FC = () => {
  const [user, setUser] = useState<clientResponse | null>(null);
  const [isProfessional, setIsProfessional] = useState(false);
  const [activePlans, setActivePlans] = useState<clientServicePlanResponse[]>([]);
  const [recommendedProfessionals, setRecommendedProfessionals] = useState<professionalResponse[]>([]);
  const [offeredServices, setOfferedServices] = useState<servicePlanResponse[]>([]);
  const [clients, setClients] = useState<clientResponse[]>([]);
  const [score, setScore] = useState<professionalScoreResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    durationInDays: 30,
    price: 0,
    type: 0
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // State for edit/delete service plan modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedServicePlan, setSelectedServicePlan] = useState<servicePlanResponse | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    durationInDays: 30,
    price: 0,
    type: 0
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // State for deactivate/activate client plan modals
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [selectedClientPlan, setSelectedClientPlan] = useState<clientServicePlanResponse | null>(null);
  const [deactivateReason, setDeactivateReason] = useState("");
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);
  const [activateLoading, setActivateLoading] = useState(false);
  const [activateError, setActivateError] = useState<string | null>(null);

  // State for client plan status filter
  const [clientPlanStatusFilter, setClientPlanStatusFilter] = useState<string>("all");

  const [professionalImages, setProfessionalImages] = useState<{[id: string]: string}>({});
  const [clientImages, setClientImages] = useState<{[id: string]: string}>({});

  const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId') || '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get logged-in user info
        const userData = await ProfessionalManagementService.getClientById(userId);
        setUser(userData);
        setIsProfessional(userData.isNutritionist || userData.isTrainer);
        setActivePlans(userData.clientServicePlans);
        // Get recommended professionals
        const professionals = await ProfessionalManagementService.getProfessionals();
        setRecommendedProfessionals(professionals);
        // Fetch professional images
        const profImagePromises = professionals.map(async (p) => {
          try {
            const profile = await SocialService.viewProfileSimplified(p.id);
            return { id: p.id, imageUrl: profile.imageUrl };
          } catch {
            return { id: p.id, imageUrl: '' };
          }
        });
        const profImages = await Promise.all(profImagePromises);
        setProfessionalImages(Object.fromEntries(profImages.map(p => [p.id, p.imageUrl])));

        if (userData.isNutritionist || userData.isTrainer) {
          // Get professional services
          const profDetails = await ProfessionalManagementService.getProfessionalById(userId);
          setOfferedServices(profDetails.servicePlans ?? []);

          // Get professional clients
          const profClients = await ProfessionalManagementService.getProfessionalClients(userId);
          setClients(profClients ?? []);
          // Fetch client images
          const clientImagePromises = (profClients ?? []).map(async (c) => {
            try {
              const profile = await SocialService.viewProfileSimplified(c.id);
              return { id: c.id, imageUrl: profile.imageUrl };
            } catch {
              return { id: c.id, imageUrl: '' };
            }
          });
          const clientImagesArr = await Promise.all(clientImagePromises);
          setClientImages(Object.fromEntries(clientImagesArr.map(c => [c.id, c.imageUrl])));

          // Get professional score
          const profScore = await ProfessionalManagementService.getProfessionalScoreById(userId);
          setScore(profScore);
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar dados.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  // Helper functions for enum mapping
  const getServiceTypeLabel = (type: number) => {
    switch(type) {
      case 0: return 'Treino';
      case 1: return 'Dieta';
      default: return 'Outro';
    }
  };
  const getStatusLabel = (status: number) => {
    switch(status) {
      case 0: return 'Ativo';
      case 1: return 'Cancelado';
      case 2: return 'Expirado';
      default: return 'Desconhecido';
    }
  };
  const getProfessionalTypeLabel = (type: number) => {
    switch(type) {
      case 0: return 'Personal Trainer';
      case 1: return 'Nutricionista';
      case 2: return 'Personal Trainer e Nutricionista';
      default: return 'Profissional';
    }
  };

  const handleCreateServicePlan = async () => {
    setCreateLoading(true);
    setCreateError(null);
    try {
      const newService = await ProfessionalManagementService.createServicePlan(createForm);
      setShowCreateModal(false);
      setCreateForm({ title: "", description: "", durationInDays: 30, price: 0, type: 0 });
      // Adiciona o novo serviço ao estado local
      setOfferedServices(prev => [...prev, newService]);
    } catch (err: unknown) {
      setCreateError((err as Error).message || "Erro ao criar serviço.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditServicePlan = async () => {
    if (!selectedServicePlan) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const updatedService = await ProfessionalManagementService.updateServicePlanById(selectedServicePlan.id, editForm);
      setShowEditModal(false);
      setEditForm({ title: "", description: "", durationInDays: 30, price: 0, type: 0 });
      // Atualiza o serviço no estado local
      setOfferedServices(prev => prev.map(s => s.id === updatedService.id ? updatedService : s));
    } catch (err: unknown) {
      setEditError((err as Error).message || "Erro ao editar serviço.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteServicePlan = async () => {
    if (!selectedServicePlan) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await ProfessionalManagementService.deleteServicePlanById(selectedServicePlan.id);
      setShowDeleteModal(false);
      // Remove o serviço do estado local
      setOfferedServices(prev => prev.filter(s => s.id !== selectedServicePlan.id));
    } catch (err: unknown) {
      setDeleteError((err as Error).message || "Erro ao remover serviço.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeactivateClientPlan = async () => {
    if (!selectedClientPlan) return;
    setDeactivateLoading(true);
    setDeactivateError(null);
    try {
      // Find the clientId from the clients array
      const client = clients.find(c => c.clientServicePlans.some(sp => sp.id === selectedClientPlan.id));
      if (!client) throw new Error('Cliente não encontrado.');
      const updatedClient = await ProfessionalManagementService.deactivateServicePlanFromClient(client.id, selectedClientPlan.servicePlan.id, deactivateReason);
      setShowDeactivateModal(false);
      setDeactivateReason("");
      // Atualiza o cliente no estado local
      setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    } catch (err: unknown) {
      setDeactivateError((err as Error).message || "Erro ao desativar plano do cliente.");
    } finally {
      setDeactivateLoading(false);
    }
  };

  const handleActivateClientPlan = async () => {
    if (!selectedClientPlan) return;
    setActivateLoading(true);
    setActivateError(null);
    try {
      // Find the clientId from the clients array
      const client = clients.find(c => c.clientServicePlans.some(sp => sp.id === selectedClientPlan.id));
      if (!client) throw new Error('Cliente não encontrado.');
      const updatedClient = await ProfessionalManagementService.activateServicePlanToClient(client.id, selectedClientPlan.servicePlan.id);
      setShowActivateModal(false);
      // Atualiza o cliente no estado local
      setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    } catch (err: unknown) {
      setActivateError((err as Error).message || "Erro ao ativar plano do cliente.");
    } finally {
      setActivateLoading(false);
    }
  };

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [planToCancel, setPlanToCancel] = useState<clientServicePlanResponse | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const openCancelModal = (plan: clientServicePlanResponse) => {
    setPlanToCancel(plan);
    setShowCancelModal(true);
    setCancelError(null);
  };

  const handleConfirmCancelPlan = async () => {
    if (!planToCancel) return;
    setCancelLoading(true);
    setCancelError(null);
    try {
      const userData = await ProfessionalManagementService.deactivateServicePlanFromClient(userId, planToCancel.servicePlan.id, '');
      setActivePlans(userData.clientServicePlans)
      setShowCancelModal(false);
      setPlanToCancel(null);
    } catch (err: any) {
      setCancelError(err.message || 'Erro ao cancelar plano.');
    } finally {
      setCancelLoading(false);
    }
  };

  const navigate = useNavigate();

  // State for reactivate plan
  const [reactivateLoading, setReactivateLoading] = useState(false);
  const [reactivateError, setReactivateError] = useState<string | null>(null);

  const handleReactivatePlan = async (plan: clientServicePlanResponse) => {
    setReactivateLoading(true);
    setReactivateError(null);
    try {
      const userData = await ProfessionalManagementService.activateServicePlanToClient(user.id,plan.servicePlan.id);
      setActivePlans(userData.clientServicePlans);
    } catch (err: any) {
      setReactivateError(err.message || 'Erro ao reativar plano.');
    } finally {
      setReactivateLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-[#8b93a7]">Carregando dados...</div>;
  if (error) return <div className="text-center py-12 text-red-400">{error}</div>;

  return (
    <div className="min-h-screen w-full bg-[#0f1420] text-[#e8ecf8]" style={{
      background: "radial-gradient(1200px 600px at 10% -10%, #1b2437 0, transparent 60%), #0f1420"
    }}>
      <div className="container mx-auto max-w-6xl px-4 py-8 grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6">
        {/* LEFT */}
        <div className="space-y-6">
          <section className="bg-[#161b28] border border-[#222737] rounded-[14px] p-5 shadow">
            <h2 className="text-base font-semibold mb-2">Planos Ativos</h2>
            <div className="space-y-3">
              {activePlans.length === 0 ? (
                <div className="text-center text-[#8b93a7] py-4">Nenhum plano ativo encontrado.</div>
              ) : (
                activePlans.map((plan) => (
                  <div key={plan.id} className="bg-[#161b28] border border-[#222737] rounded-xl p-4 shadow flex flex-col gap-2">
                    <div className="font-semibold">{plan.servicePlan.title}</div>
                    <div className="text-[#8b93a7]">{plan.servicePlan.description}</div>
                    <div className="text-[#8b93a7]">Duração: {plan.servicePlan.durationInDays} dias • Preço: R$ {plan.servicePlan.price.toFixed(2).replace('.', ',')} • Tipo: {getServiceTypeLabel(plan.servicePlan.type)}</div>
                    <div className="text-[#8b93a7]">Status: {getStatusLabel(plan.status)}</div>
                    <div className="flex gap-2 mt-2">
                      {plan.status === 1 ? (
                        <button className="btn small success px-3 py-1 rounded-lg border border-[#6ea8fe] text-[#e8ecf8] bg-[#2b3347] flex items-center gap-1"
                          onClick={() => handleReactivatePlan(plan)}
                          disabled={reactivateLoading}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 8v4l3 3"/>
                          </svg> Reativar
                        </button>
                      ) : (
                        <button className="btn small danger px-3 py-1 rounded-lg border border-[#ff5d6c] text-[#ffc7cd] bg-transparent flex items-center gap-1"
                          onClick={() => openCancelModal(plan)}
                          disabled={cancelLoading}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="15" y1="9" x2="9" y2="15"/>
                          </svg> Cancelar
                        </button>
                      )}
                      <button
                        className="btn small primary px-3 py-1 rounded-lg border border-[#6ea8fe] text-[#e8ecf8] bg-[#2b3347] flex items-center gap-1"
                        onClick={() => navigate(`/profissional/${plan.servicePlan.professionalId}`, { state: { user } })}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M12 8v4l3 3"/>
                        </svg> Ver perfil do profissional
                      </button>
                    </div>
                    {reactivateError && <div className="text-red-500 text-sm mt-2">{reactivateError}</div>}
                  </div>
                ))
              )}
            </div>
          </section>
          <section className="bg-[#161b28] border border-[#222737] rounded-[14px] p-5 shadow">
            <h2 className="text-base font-semibold mb-2">Profissionais Recomendados</h2>
            <div className="space-y-3">
              {recommendedProfessionals.length === 0 ? (
                <div className="text-center text-[#8b93a7] py-4">Nenhum profissional recomendado encontrado.</div>
              ) : (
                recommendedProfessionals.map((professional) => (
                  <button
                    key={professional.id}
                    className="bg-[#161b28] border border-[#222737] rounded-xl p-4 shadow flex flex-col gap-2 w-full text-left cursor-pointer"
                    onClick={() => navigate(`/profissional/${professional.id}`, { state: { user } })}
                  >
                    <div className="flex gap-3 items-center">
                      <img src={professionalImages[professional.id] || '/placeholder.svg'} alt="avatar" className="avatar w-10 h-10 rounded-full bg-[#2b3347] object-cover" />
                      <div>
                        <div className="font-semibold">{professional.name}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className="tag px-3 py-1 rounded-full bg-[#1b2233] border border-[#222737] text-xs">{getProfessionalTypeLabel(professional.type)}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>
          {/* Serviços Oferecidos - only for professionals */}
          {isProfessional && (
            <section className="bg-[#161b28] border border-[#222737] rounded-[14px] p-5 shadow">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-semibold">Serviços Oferecidos</h2>
                <button
                  className="text-base font-semibold h-8 px-3 rounded-md bg-gradient-to-br from-[#6ea8fe] to-[#7ef0c1] text-[#0b1222] shadow flex items-center"
                  style={{border:'none'}}
                  onClick={() => setShowCreateModal(true)}
                >
                  + Novo serviço
                </button>
              </div>
              <div className="space-y-3">
                {offeredServices.length === 0 ? (
                  <div className="text-center text-[#8b93a7] py-4">Nenhum serviço oferecido encontrado.</div>
                ) : (
                  offeredServices.map((service) => (
                    <div key={service.id} className="bg-[#161b28] border border-[#222737] rounded-xl p-4 shadow flex flex-col gap-2">
                      <div className="font-semibold">{service.title}</div>
                      <div className="text-[#8b93a7]">{service.description}</div>
                      <div className="text-[#8b93a7]">Duração: {service.durationInDays} dias • Preço: R$ {service.price.toFixed(2).replace('.', ',')} • Tipo: {getServiceTypeLabel(service.type)}</div>
                      <div className="flex gap-2 mt-2">
                        <button className="btn small px-3 py-1 rounded-lg border border-[#222737] text-[#e8ecf8] bg-transparent flex items-center gap-1" onClick={() => { setSelectedServicePlan(service); setEditForm({ title: service.title, description: service.description, durationInDays: service.durationInDays, price: service.price, type: service.type }); setShowEditModal(true); }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M12 20h9"/>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                        </svg> Editar
                        </button>
                        <button className="btn small danger px-3 py-1 rounded-lg border border-[#ff5d6c] text-[#ffc7cd] bg-transparent flex items-center gap-1" onClick={() => { setSelectedServicePlan(service); setShowDeleteModal(true); }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6"/>
                            <path d="M14 11v6"/>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg> Remover
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}
          {/* Clientes - only for professionals */}
          {isProfessional && (
            <section className="bg-[#161b28] border border-[#222737] rounded-[14px] p-5 shadow">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-semibold">Clientes</h2>
                <select
                  className="bg-[#1b2233] border border-[#222737] rounded-full px-3 py-1 text-xs text-[#e8ecf8]"
                  value={clientPlanStatusFilter}
                  onChange={e => setClientPlanStatusFilter(e.target.value)}
                >
                  <option value="all">Sem filtro</option>
                  <option value="ativo">Ativo</option>
                  <option value="cancelado">Cancelado</option>
                  <option value="expirado">Expirado</option>
                </select>
              </div>
              <div className="space-y-3">
                {(() => {
                  const filteredClients = clients.filter(client => {
                    if (clientPlanStatusFilter === "all") return true;
                    return (client.clientServicePlans).some(plan => {
                      if (clientPlanStatusFilter === "ativo") return plan.status === 0;
                      if (clientPlanStatusFilter === "cancelado") return plan.status === 1;
                      if (clientPlanStatusFilter === "expirado") return plan.status === 2;
                      return true;
                    });
                  });
                  if (filteredClients.length === 0) {
                    return <div className="text-center text-[#8b93a7] py-4">Nenhum cliente encontrado.</div>;
                  }
                  return filteredClients.map((client) => (
                    <div key={client.id} className="bg-[#161b28] border border-[#222737] rounded-xl p-4 shadow">
                      <div className="flex gap-3 items-center">
                        <img src={clientImages[client.id] || '/placeholder.svg'} alt="avatar" className="avatar w-10 h-10 rounded-full bg-[#2b3347] object-cover" />
                        <div>
                          <div className="font-semibold">{client.name}</div>
                          <div className="text-[#8b93a7]">{client.email}</div>
                        </div>
                      </div>
                      {/* List all service plans for this client */}
                      {(client.clientServicePlans ?? [])
                        .filter(plan => {
                          if (clientPlanStatusFilter === "all") return true;
                          if (clientPlanStatusFilter === "ativo") return plan.status === 0;
                          if (clientPlanStatusFilter === "cancelado") return plan.status === 1;
                          if (clientPlanStatusFilter === "expirado") return plan.status === 2;
                          return true;
                        })
                        .map((plan) => (
                          <div key={plan.id} className="mt-2 text-[#8b93a7] border-t border-[#222737] pt-2">
                            <div>
                              Plano: {plan.servicePlan.title}
                            </div>
                            <div>
                              Período: {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                            </div>
                            <div>
                              Tipo: {getServiceTypeLabel(plan.servicePlan.type)}
                            </div>
                            <div>Status: {getStatusLabel(plan.status)}</div>
                            <div className="flex gap-2 mt-2">
                              <button className="btn small px-3 py-1 rounded-lg border border-[#222737] text-[#e8ecf8] bg-transparent flex items-center gap-1">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>
                                </svg> Mensagem
                              </button>
                              {plan.status === 0 ? (
                                <button className="btn small danger px-3 py-1 rounded-lg border border-[#ff5d6c] text-[#ffc7cd] bg-transparent flex items-center gap-1" onClick={() => { setSelectedClientPlan(plan); setShowDeactivateModal(true); }}>
                                  Desativar
                                </button>
                              ) : (
                                <button className="btn small primary px-3 py-1 rounded-lg border border-[#6ea8fe] text-[#e8ecf8] bg-transparent flex items-center gap-1" onClick={() => { setSelectedClientPlan(plan); setShowActivateModal(true); }}>
                                  Ativar
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  ));
                })()}
              </div>
            </section>
          )}
        </div>
        {/* RIGHT */}
        <div className="sticky top-24 h-fit space-y-6">
          <section className="bg-[#161b28] border border-[#222737] rounded-[14px] p-5 shadow">
            <h2 className="text-base font-semibold mb-2">Resumo</h2>
            <div className="space-y-2">
              <div className="flex justify-between"><span>Planos Ativos</span><strong>{activePlans.length}</strong></div>
              {isProfessional && <div className="flex justify-between"><span>Serviços Oferecidos</span><strong>{offeredServices.length}</strong></div>}
              {isProfessional && <div className="flex justify-between"><span>Clientes (ativos)</span><strong>{clients.reduce((acc, client) => acc + (client.clientServicePlans ?? []).filter(sp => sp.status === 0).length, 0)}</strong></div>}
              <div className="flex justify-between"><span>Recomendados</span><strong>{recommendedProfessionals.length}</strong></div>
            </div>
          </section>
          <section className="bg-[#161b28] border border-[#222737] rounded-[14px] p-5 shadow">
            <h2 className="text-base font-semibold mb-2">Dicas</h2>
            <div className="text-[#8b93a7] bg-[#1b2233] rounded-xl p-4 border border-dashed border-[#222737]">
              {isProfessional ? "Clique em um profissional para abrir seu perfil. Edite ou crie serviços, filtre a lista de clientes e cancele planos ativos." : "Clique em um profissional para abrir seu perfil. Veja os seus planos ativos e cancele-os se necessário."}
            </div>
          </section>
        </div>
      </div>
      {/* Modal de criação de serviço */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo serviço</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-[#e8ecf8]">Título</label>
              <Input
                placeholder="Título"
                value={createForm.title}
                onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-[#e8ecf8]">Descrição</label>
              <Input
                placeholder="Descrição"
                value={createForm.description}
                onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block mb-1 text-sm font-medium text-[#e8ecf8]">Duração (dias)</label>
                <Input
                  type="number"
                  min={1}
                  placeholder="Duração (dias)"
                  value={createForm.durationInDays}
                  onChange={e => setCreateForm(f => ({ ...f, durationInDays: Number(e.target.value) }))}
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 text-sm font-medium text-[#e8ecf8]">Preço (R$)</label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="Preço (R$)"
                  value={createForm.price}
                  onChange={e => setCreateForm(f => ({ ...f, price: Number(e.target.value) }))}
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 text-sm font-medium text-[#e8ecf8]">Tipo</label>
                <Select
                  value={String(createForm.type)}
                  onValueChange={v => setCreateForm(f => ({ ...f, type: Number(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Treino</SelectItem>
                    <SelectItem value="1">Dieta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {createError && <div className="text-red-400 text-sm">{createError}</div>}
            <div className="flex justify-end gap-2 mt-2">
              <button className="btn px-4 py-2 rounded-lg border border-[#222737] text-[#e8ecf8] bg-transparent" onClick={() => setShowCreateModal(false)} disabled={createLoading}>Cancelar</button>
              <button className="btn primary px-4 py-2 rounded-lg border border-[#6ea8fe] text-[#e8ecf8] bg-[#2b3347]" onClick={handleCreateServicePlan} disabled={createLoading}>
                {createLoading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Modal de confirmação de cancelamento de plano */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar cancelamento</DialogTitle>
          </DialogHeader>
          {planToCancel && (
            <div className="space-y-2">
              <div>Tem certeza que deseja cancelar o plano <strong>{planToCancel.servicePlan.title}</strong>?</div>
              <div>Período: {new Date(planToCancel.startDate).toLocaleDateString()} - {new Date(planToCancel.endDate).toLocaleDateString()}</div>
            </div>
          )}
          {cancelError && <div className="text-red-500 text-sm mt-2">{cancelError}</div>}
          <div className="flex gap-2 mt-4">
            <button
              className="btn danger px-4 py-2 rounded-lg border border-[#ff5d6c] text-[#ffc7cd] bg-[#2b3347]"
              onClick={handleConfirmCancelPlan}
              disabled={cancelLoading}
            >
              {cancelLoading ? 'Cancelando...' : 'Confirmar'}
            </button>
            <button
              className="btn px-4 py-2 rounded-lg border border-[#222737] text-[#e8ecf8] bg-transparent"
              onClick={() => setShowCancelModal(false)}
              disabled={cancelLoading}
            >
              Cancelar
            </button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Modal de edição de serviço */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar serviço</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-[#e8ecf8]">Título</label>
              <Input
                placeholder="Título"
                value={editForm.title}
                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-[#e8ecf8]">Descrição</label>
              <Input
                placeholder="Descrição"
                value={editForm.description}
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block mb-1 text-sm font-medium text-[#e8ecf8]">Duração (dias)</label>
                <Input
                  type="number"
                  min={1}
                  placeholder="Duração (dias)"
                  value={editForm.durationInDays}
                  onChange={e => setEditForm(f => ({ ...f, durationInDays: Number(e.target.value) }))}
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 text-sm font-medium text-[#e8ecf8]">Preço (R$)</label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="Preço (R$)"
                  value={editForm.price}
                  onChange={e => setEditForm(f => ({ ...f, price: Number(e.target.value) }))}
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 text-sm font-medium text-[#e8ecf8]">Tipo</label>
                <Select
                  value={String(editForm.type)}
                  onValueChange={v => setEditForm(f => ({ ...f, type: Number(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Treino</SelectItem>
                    <SelectItem value="1">Dieta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {editError && <div className="text-red-400 text-sm">{editError}</div>}
            <div className="flex justify-end gap-2 mt-2">
              <button className="btn px-4 py-2 rounded-lg border border-[#222737] text-[#e8ecf8] bg-transparent" onClick={() => setShowEditModal(false)} disabled={editLoading}>Cancelar</button>
              <button className="btn primary px-4 py-2 rounded-lg border border-[#6ea8fe] text-[#e8ecf8] bg-[#2b3347]" onClick={handleEditServicePlan} disabled={editLoading}>
                {editLoading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Modal de confirmação de exclusão de serviço */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-[#8b93a7]">
            Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.
          </div>
          <div className="flex justify-center gap-2">
            <button className="btn px-4 py-2 rounded-lg border border-[#222737] text-[#e8ecf8] bg-transparent" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>Cancelar</button>
            <button className="btn danger px-4 py-2 rounded-lg border border-[#ff5d6c] text-[#ffc7cd] bg-[#2b3347]" onClick={handleDeleteServicePlan} disabled={deleteLoading}>
              {deleteLoading ? "Excluindo..." : "Excluir serviço"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Modal de desativação de plano de cliente */}
      <Dialog open={showDeactivateModal} onOpenChange={setShowDeactivateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desativar plano de cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-[#8b93a7]">
              Informe o motivo da desativação (opcional):
            </div>
            <Input
              placeholder="Motivo"
              value={deactivateReason}
              onChange={e => setDeactivateReason(e.target.value)}
            />
            {deactivateError && <div className="text-red-400 text-sm">{deactivateError}</div>}
            <div className="flex justify-end gap-2 mt-2">
              <button className="btn px-4 py-2 rounded-lg border border-[#222737] text-[#e8ecf8] bg-transparent" onClick={() => setShowDeactivateModal(false)} disabled={deactivateLoading}>Cancelar</button>
              <button className="btn danger px-4 py-2 rounded-lg border border-[#ff5d6c] text-[#ffc7cd] bg-[#2b3347]" onClick={handleDeactivateClientPlan} disabled={deactivateLoading}>
                {deactivateLoading ? "Desativando..." : "Desativar plano"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Modal de ativação de plano de cliente */}
      <Dialog open={showActivateModal} onOpenChange={setShowActivateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ativar plano de cliente</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-[#8b93a7]">
            Tem certeza que deseja ativar este plano de cliente?
          </div>
          <div className="flex justify-center gap-2">
            <button className="btn px-4 py-2 rounded-lg border border-[#222737] text-[#e8ecf8] bg-transparent" onClick={() => setShowActivateModal(false)} disabled={activateLoading}>Cancelar</button>
            <button className="btn primary px-4 py-2 rounded-lg border border-[#6ea8fe] text-[#e8ecf8] bg-[#2b3347]" onClick={handleActivateClientPlan} disabled={activateLoading}>
              {activateLoading ? "Ativando..." : "Ativar plano"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfessionalsHub;
