import React, {useEffect, useState} from "react";
import "./training.css";
import {TrainingService} from "@/services/trainingService";
import {ProfessionalManagementService} from "@/services/professionalManagementService";
import {
	exerciseResponse,
	MeasurementUnit,
	MuscleGroup,
	workoutResponse,
	workoutSessionResponse,
	WorkoutVisibility
} from "@/types/trainingService";
import {
	getMainMuscleGroups,
	getRelatedMuscleGroups,
	getSecondaryMuscleGroups,
	muscleGroupToPtBr
} from "@/lib/muscleGroupUtils";
import {paintSvgByIds} from "@/lib/svgPaintUtils";
import rawSvg from "@/images/FrontViewMuscleMap.svg?raw";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";

// Helper: Format rest time from seconds
function fmtRest(seconds?: number) {
  if (!seconds) return "0m 0s";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}
// Helper: Get user name from id
function ownerName(userId: string, clients: {id: string, name: string}[], currentUserId: string) {
  if (userId === currentUserId) return "Você";
  const c = clients.find(c => c.id === userId);
  return c ? c.name : "—";
}
// Helper: Get selected workout for current mode
function getCurrentWorkout(workouts: workoutResponse[], groupedWorkouts: {client: {id: string, name: string}, workouts: workoutResponse[]}[], selectedWorkoutId: string | null, isPro: boolean, proTab: string): workoutResponse | null {
  if (!selectedWorkoutId) return null;
  if (isPro && proTab === "clientes") {
    for (const group of groupedWorkouts) {
      const found = group.workouts.find(w => w.id === selectedWorkoutId);
      if (found) return found;
    }
    return null;
  }
  return workouts.find(w => w.id === selectedWorkoutId) || null;
}
// Helper: Get exercise by id
function getExerciseById(exercises: exerciseResponse[], id: string) {
  return exercises.find(e => e.id === id) || null;
}
// Helper: Get muscle areas for SVG
function collectMuscleAreas(exercises: exerciseResponse[]) {
  const set = new Set<string>();
  exercises.forEach(ex => {
    const muscleArr = ex.muscleGroups ?? [];
    muscleArr.forEach(m => set.add(m.toString()));
  });
  return Array.from(set);
}

export default function Training() {
	// State
	const [isPro, setIsPro] = useState(false);
	const [proTab, setProTab] = useState("meus");
	const [search, setSearch] = useState("");
	const [exercises, setExercises] = useState<exerciseResponse[]>([]);
	const [workouts, setWorkouts] = useState<workoutResponse[]>([]);
	const [clients, setClients] = useState<{id: string, name: string}[]>([]);
	const [groupedWorkouts, setGroupedWorkouts] = useState<{client: {id: string, name: string}, workouts: workoutResponse[]}[]>([]);
	const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
	const [showForm, setShowForm] = useState(false);
	const [formMode, setFormMode] = useState("create");
	const [formData, setFormData] = useState<{ name: string; restMin: number; restSec: number; client: string; exercises: string[] }>({ name: "", restMin: 0, restSec: 0, client: "", exercises: [] });
	const [showModal, setShowModal] = useState(false);
	const [modalSelected, setModalSelected] = useState<string[]>([]);
	const [modalFilter, setModalFilter] = useState({ q: "", groups: new Set<MuscleGroup>(), muscles: new Set<MuscleGroup>() });
	const [currentUserId, setCurrentUserId] = useState<string>("");

	// Delete workout state
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	// Workout sessions state
	const [workoutSessions, setWorkoutSessions] = useState<workoutSessionResponse[]>([]);
	const [sessionsLoading, setSessionsLoading] = useState(false);
	const [selectedSession, setSelectedSession] = useState<workoutSessionResponse | null>(null);

	// Fetch user info and exercises on mount
	useEffect(() => {
		async function fetchInitial() {
			// Get logged user info
			// Replace with your auth logic if needed
			const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId") || "";
			setCurrentUserId(userId);
			// Check if user is professional
			try {
				const client = await ProfessionalManagementService.getClientById(userId);
				setIsPro(client.isTrainer);
			} catch (err) {
				// Could not fetch client info, assume not pro
				setIsPro(false);
			}
			// Get all exercises
			const exs = await TrainingService.getExercisesByMuscleGroup();
			setExercises(exs);
		}
		fetchInitial();
	}, []);

	// Fetch workouts for user or clients
	useEffect(() => {
		async function fetchWorkouts() {
			if (!currentUserId) return;
			if (isPro && proTab === "clientes") {
				// Get clients and their workouts
				const profClients = await ProfessionalManagementService.getProfessionalClients(currentUserId);
				setClients(profClients);
				const grouped = await Promise.all(profClients.map(async (client: {id: string, name: string}) => {
					const ws = await TrainingService.getWorkoutsByUserId(client.id);
					// Filter workouts to only those created by current user
					const filteredWs = ws.filter(w => w.creatorId === currentUserId);
					return { client, workouts: filteredWs };
				}));
				setGroupedWorkouts(grouped.filter(g => g.workouts.length));
				setWorkouts([]);
			} else {
				// Get workouts for current user
				const ws = await TrainingService.getWorkoutsByUserId(currentUserId);
				setWorkouts(ws);
				setGroupedWorkouts([]);
			}
		}
		fetchWorkouts();
	}, [isPro, proTab, currentUserId]);

	// Fetch workout sessions when a workout is selected and not in form mode
	useEffect(() => {
	  async function fetchSessions() {
	    if (!selectedWorkoutId || showForm) {
	      setWorkoutSessions([]);
	      setSessionsLoading(false);
	      return;
	    }
	    setSessionsLoading(true);
	    try {
	      const sessions = await TrainingService.getWorkoutSessionsByWorkoutId(selectedWorkoutId);
	      setWorkoutSessions(sessions);
	    } catch (err) {
	      setWorkoutSessions([]);
	    } finally {
	      setSessionsLoading(false);
	    }
	  }
	  fetchSessions();
	}, [selectedWorkoutId, showForm]);

	// Filtered workouts
	const filteredWorkouts = workouts.filter(w => w.name.toLowerCase().includes(search.toLowerCase()));
	const workout = getCurrentWorkout(workouts, groupedWorkouts, selectedWorkoutId, isPro, proTab);

	function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
		setSearch(e.target.value);
	}
	function handleClearSearch() {
		setSearch("");
	}
	function handleSelectWorkout(id: string) {
		if (selectedWorkoutId === id) {
			setSelectedWorkoutId(null);
			setShowForm(false);
		} else {
			setSelectedWorkoutId(id);
			setShowForm(false);
		}
	}
	function handleNewWorkout() {
		setFormMode("create");
		setFormData({ name: "", restMin: 0, restSec: 0, client: clients[0]?.id || "", exercises: [] });
		setShowForm(true);
		setSelectedWorkoutId(null);
	}
	function handleEditWorkout() {
		if (!workout) return;
		setFormMode("edit");
		setFormData({
			name: workout.name,
			restMin: Math.floor((workout.restingTimeInSeconds || 0) / 60),
			restSec: (workout.restingTimeInSeconds || 0) % 60,
			client: workout.userId,
			exercises: workout.exercises.map(e => e.id),
		});
		setShowForm(true);
	}
	function handleDeleteWorkout() {
		if (!workout) return;
		setShowDeleteModal(true);
		setDeleteError(null);
	}
	async function handleConfirmDeleteWorkout() {
		if (!workout) return;
		setDeleteLoading(true);
		setDeleteError(null);
		try {
			await TrainingService.deleteWorkoutById(workout.id);
			if (isPro && proTab === "clientes") {
				// Remove workout from groupedWorkouts locally
				const updatedGroups = groupedWorkouts
					.map(group => ({
						client: group.client,
						workouts: group.workouts.filter(w => w.id !== workout.id)
					}))
					.filter(group => group.workouts.length > 0);
				setGroupedWorkouts(updatedGroups);
				setWorkouts([]);
			} else {
				setWorkouts(workouts.filter(w => w.id !== workout.id));
			}
			setSelectedWorkoutId(null);
			setShowForm(false);
			setShowDeleteModal(false);
		} catch (err: any) {
			setDeleteError(err.message || 'Erro ao excluir treino.');
		} finally {
			setDeleteLoading(false);
		}
	}
	function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
		const { name, value } = e.target;
		setFormData(fd => ({ ...fd, [name]: value }));
	}
	function handleFormExerciseRemove(id: string) {
		setFormData(fd => ({ ...fd, exercises: fd.exercises.filter(x => x !== id) }));
	}
	async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const data = {
			name: formData.name.trim() || "Treino",
			restingTimeInSeconds: Number(formData.restMin || 0) * 60 + Number(formData.restSec || 0),
			exercises: formData.exercises,
		};
		let newWorkout: workoutResponse | null = null;
		if (formMode === "edit" && workout) {
			// Update workout via API
			newWorkout = await TrainingService.updateWorkout(workout.id, {
				...data,
				visibility: workout.visibility,
			});
			setWorkouts(ws => ws.map(w => w.id === workout.id ? newWorkout! : w));
			setSelectedWorkoutId(workout.id);
			setShowForm(false);
		} else {
			// Create workout via API
			if (isPro && proTab === "clientes") {
				newWorkout = await TrainingService.createWorkoutForClient(formData.client, {
					...data,
					visibility: WorkoutVisibility.Private,
				});
				// Add to groupedWorkouts locally
				setGroupedWorkouts(prev => {
					const idx = prev.findIndex(g => g.client.id === formData.client);
					if (idx !== -1) {
						// Client exists, add workout
						const updated = [...prev];
						updated[idx] = {
							client: updated[idx].client,
							workouts: [newWorkout!, ...updated[idx].workouts]
						};
						return updated;
					} else {
						// New client group
						const clientObj = clients.find(c => c.id === formData.client);
						if (!clientObj) return prev;
						return [{ client: clientObj, workouts: [newWorkout!] }, ...prev];
					}
				});
				setWorkouts([]);
			} else {
				newWorkout = await TrainingService.createWorkout({
					...data,
					visibility: WorkoutVisibility.Private,
				});
				setWorkouts(ws => [newWorkout!, ...ws]);
			}
			setSelectedWorkoutId(newWorkout!.id);
			setShowForm(false);
		}
	}
	function handleOpenModal(selected: string[]) {
		setModalSelected(selected);
		setModalFilter({ q: "", groups: new Set(), muscles: new Set() });
		setShowModal(true);
	}
	function handleModalApply() {
		if (showForm) {
			setFormData(fd => ({ ...fd, exercises: modalSelected }));
		} else if (workout) {
			TrainingService.updateWorkout(workout.id, {
				name: workout.name,
				restingTimeInSeconds: workout.restingTimeInSeconds,
				exercises: modalSelected,
				visibility: workout.visibility,
			}).then(updated => {
				if (isPro && proTab === "clientes") {
					setGroupedWorkouts(groups => groups.map(group => ({
						...group,
						workouts: group.workouts.map(w => w.id === updated.id ? updated : w)
					})));
				} else {
					setWorkouts(ws => ws.map(w => w.id === workout.id ? updated : w));
				}
			});
		}
		setShowModal(false);
	}
	function handleModalFilterChange(type: "groups" | "muscles", key: MuscleGroup) {
		setModalFilter(f => {
			const set = new Set(f[type]);
			if (set.has(key)) set.delete(key); else set.add(key);
			return { ...f, [type]: set };
		});
	}
	function handleModalSearch(e: React.ChangeEvent<HTMLInputElement>) {
		setModalFilter(f => ({ ...f, q: e.target.value }));
	}
	function handleModalClearFilters() {
		setModalFilter({ q: "", groups: new Set(), muscles: new Set() });
	}
	function handleModalSelect(id: string, checked: boolean) {
		setModalSelected(sel => checked ? [...sel, id] : sel.filter(x => x !== id));
	}

	// ====== Render ======
	const isClients = isPro && proTab === "clientes";
	const mainMuscleGroups = getMainMuscleGroups();
	const secondaryMuscleGroups = getSecondaryMuscleGroups();
	return (
		<div>
			<div className="training-main">
				{/* LEFT COLUMN: LIST */}
				<section className="col">
					<div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
						{isPro && (
							<div className="tabs" style={{ display: "flex", justifyContent: "center", marginTop: 12 }} role="tablist" aria-label="Tipo de lista">
								<button className="tab" role="tab" aria-selected={proTab === "meus"} onClick={() => setProTab("meus")}>Meus Treinos</button>
								<button className="tab" role="tab" aria-selected={proTab === "clientes"} onClick={() => setProTab("clientes")}>Meus Clientes</button>
							</div>
						)}
					</div>
					<div className="search">
						<input value={search} onChange={handleSearch} placeholder="Pesquisar treino..." />
						<button className="btn ghost" onClick={handleClearSearch}>Limpar</button>
					</div>
					<button className="btn primary" style={{ margin: "16px 0", alignSelf: "center" }} onClick={handleNewWorkout}>+ Novo Treino</button>
					<div className="list">
						{isPro && proTab === "clientes" ? (
							groupedWorkouts.length ? groupedWorkouts.map(g => (
								<React.Fragment key={g.client.id}>
									<div style={{ margin: "8px 6px 2px" }}>
										<div className="muted" style={{ fontWeight: 600 }}>{g.client.name}</div>
									</div>
									{g.workouts.map((w: workoutResponse) => (
										<WorkoutCard key={w.id} w={w} isPro={isPro} isClients={true} onSelect={handleSelectWorkout} clients={clients} currentUserId={currentUserId} />
									))}
								</React.Fragment>
							)) : <div className="empty">Nenhum treino encontrado.</div>
						) : (
							filteredWorkouts.length ? filteredWorkouts.map(w => (
								<WorkoutCard key={w.id} w={w} isPro={isPro} isClients={isClients} onSelect={handleSelectWorkout} clients={clients} currentUserId={currentUserId} />
							)) : <div className="empty">Nenhum treino encontrado.</div>
						)}
					</div>
				</section>
				{/* RIGHT COLUMN: DETAIL/FORM */}
				<section className="col">
					<div className="detail" style={{ overflowY: "auto" }}>
						<div className="head">
							<div className="row">
								<h2 style={{ padding: 0, border: 0, margin: 0 }}>
									{showForm ? (formMode === "edit" ? "Editar Treino" : "Criar Novo Treino") : (workout ? workout.name : "Selecione um treino à esquerda")}
								</h2>
							</div>
							<div className="row" style={{ display: showForm || !workout ? "none" : "flex" }}>
								<button className="btn" onClick={handleEditWorkout} disabled={workout?.creatorId !== currentUserId}>Editar</button>
								<button className="btn danger" onClick={handleDeleteWorkout} disabled={workout?.creatorId !== currentUserId}>Excluir</button>
							</div>
						</div>
						{/* DETAIL BODY */}
						<div className="body" style={{ display: showForm || !workout ? "none" : "grid" }}>
							{/* MAP & META */}
							<div className="panel">
								<div className="svg-wrap">
									<MuscleMap activeAreas={collectMuscleAreas(workout?.exercises || [])} />
								</div>
								<div className="legend"><span className="box"></span><small>Áreas ativadas pelos exercícios selecionados</small></div>
								<div style={{ height: 8 }}></div>
								<div className="split">
									<div>
										<label className="muted">Cliente</label>
										<div style={{ marginTop: 6 }}>{ownerName(workout?.userId || "", clients, currentUserId)}</div>
									</div>
									<div>
										<label className="muted">Intervalo de descanso</label>
										<div style={{ marginTop: 6 }}>{fmtRest(workout?.restingTimeInSeconds)}</div>
									</div>
								</div>
							</div>
							{/* EXERCISES & HISTORY */}
							<div className="panel">
								<div className="row" style={{ justifyContent: "space-between" }}>
									<h3 style={{ margin: 0 }}>Exercícios</h3>
									<button className="btn" onClick={() => handleOpenModal(workout?.exercises.map(e => e.id) || [])} disabled={workout?.creatorId !== currentUserId}>+ Adicionar exercícios</button>
								</div>
								<p className="muted" style={{ display: workout?.exercises?.length ? "none" : "block" }}>Nenhum exercício. Use “Adicionar exercícios”.</p>
								<div className="tags">
									{workout?.exercises?.map(ex => (
										<span key={ex.id} className="pill"><span>{ex.name}</span></span>
									))}
								</div>
								{/* HISTÓRICO DE EXECUÇÕES */}
								<div style={{ marginTop: 24 }}>
									<h4>Execuções anteriores</h4>
									{sessionsLoading ? (
										<div className="muted">Carregando...</div>
									) : workoutSessions.length === 0 ? (
										<div className="muted">Nenhuma execução registrada.</div>
									) : (
										<ul style={{ listStyle: "none", padding: 0 }}>
											{workoutSessions.map(session => {
  let sessionInfo = `Início: ${new Date(session.startedAt).toLocaleString()}`;
  if (session.endedAt) {
    const durationMs = new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime();
    const durationSec = Math.floor(durationMs / 1000);
    const min = Math.floor(durationSec / 60);
    const sec = durationSec % 60;
    sessionInfo = `Duração: ${min}m ${sec}s`;
  }
  return (
    <li key={session.sessionId} style={{ marginBottom: 8 }}>
      <button className="btn ghost" style={{ width: "100%", textAlign: "left" }} onClick={() => setSelectedSession(session)}>
        {sessionInfo} - {session.status.toString() === "Finished" ? "Finalizado" : session.status.toString() === "InProgress" ? "Em progresso" : "Cancelado"}
      </button>
    </li>
  );
})}
										</ul>
									)}
								</div>
							</div>
						</div>
						{/* FORM BODY */}
						<div className="body" style={{ display: showForm ? "grid" : "none" }}>
						  {/* LEFT: SVG Muscle Map */}
						  <div className="panel">
						    <div className="svg-wrap" style={{ marginBottom: 16 }}>
						      <MuscleMap activeAreas={collectMuscleAreas(formData.exercises.map(exid => getExerciseById(exercises, exid)).filter(Boolean))} />
						    </div>
						    <div className="legend"><span className="box"></span><small>Áreas ativadas pelos exercícios selecionados</small></div>
						  </div>
						  {/* RIGHT: Form Fields & Actions */}
						  <form className="panel" onSubmit={handleFormSubmit} style={{ minWidth: 340 }}>
						    <h3>{formMode === "edit" ? "Editar Treino" : "Criar Novo Treino"}</h3>
						    <div className="split">
						      <div>
						        <label>Nome do Treino</label>
						        <input name="name" className="input" value={formData.name} onChange={handleFormChange} placeholder="Digite o nome do treino" required />
						      </div>
						      <div>
						        <label>Intervalo de descanso</label>
						        <div className="split" style={{ gridTemplateColumns: "1fr 1fr" }}>
						          <input name="restMin" className="input" type="number" min="0" value={formData.restMin} onChange={handleFormChange} placeholder="min" />
						          <input name="restSec" className="input" type="number" min="0" max="59" value={formData.restSec} onChange={handleFormChange} placeholder="sec" />
						        </div>
						      </div>
						    </div>
						    <div style={{ height: 10 }}></div>
						    <div id="clientFieldWrap" style={{ display: isClients ? "block" : "none" }}>
						      <label>Selecione o Cliente</label>
						      <select name="client" className="input" value={formData.client} onChange={handleFormChange}>
						        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
						      </select>
						      <div style={{ height: 10 }}></div>
						    </div>
						    <div className="row" style={{ justifyContent: "space-between" }}>
						      <h3 style={{ margin: 0 }}>Exercícios</h3>
						      <button type="button" className="btn" onClick={() => handleOpenModal(formData.exercises)}>+ Selecionar exercícios</button>
						    </div>
						    <p className="muted" style={{ display: formData.exercises.length ? "none" : "block" }}>Nenhum exercício selecionado.</p>
						    <div className="tags">
						      {formData.exercises.map(exid => {
						        const ex = getExerciseById(exercises, exid);
						        return <span key={exid} className="pill"><span>{ex?.name}</span><button type="button" className="rm" title="Remover" onClick={() => handleFormExerciseRemove(exid)}>x</button></span>;
						      })}
						    </div>
						    <div style={{ height: 12 }}></div>
						    <div className="row" style={{ justifyContent: "flex-end" }}>
						      <button type="button" className="btn ghost" onClick={() => { setShowForm(false); setSelectedWorkoutId(workout?.id || null); }}>Cancelar</button>
						      <button className="btn primary" type="submit">Salvar</button>
						    </div>
						  </form>
						</div>
					</div>
				</section>
			</div>
			{/* MODAL: EXERCISE PICKER */}
			<Dialog open={showModal} onOpenChange={setShowModal}>
				<DialogContent className="min-w-[400px] max-w-[95vw] p-6">
					<DialogHeader>
						<DialogTitle>Selecionar Exercícios</DialogTitle>
					</DialogHeader>
					<div className="modal-body space-y-4">
						<div className="filter-box">
							<input className="input" value={modalFilter.q} onChange={handleModalSearch} placeholder="Pesquisar exercício" />
							<h4>Filtrar por Agrupamento Muscular</h4>
							<div className="chips">
								{mainMuscleGroups.map(g => (
									<button key={g} className="chip" data-active={modalFilter.groups.has(g)} onClick={() => handleModalFilterChange("groups", g)}>{muscleGroupToPtBr(g)}</button>
								))}
							</div>
							<h4>Filtrar por Músculo</h4>
							<div className="chips">
								{secondaryMuscleGroups.map(m => (
									<button key={m} className="chip" data-active={modalFilter.muscles.has(m)} onClick={() => handleModalFilterChange("muscles", m)}>{muscleGroupToPtBr(m)}</button>
								))}
							</div>
							<div style={{ height: 10 }}></div>
							<button className="btn ghost" type="button" onClick={handleModalClearFilters}>Limpar filtros</button>
						</div>
						<div className="exercise-list max-h-[350px] overflow-y-auto pr-2 bg-[#161b28] rounded-lg border border-[#222737] p-2">
							<ExerciseList
								selected={modalSelected}
								onSelect={handleModalSelect}
								filter={modalFilter}
								exercises={exercises}
							/>
						</div>
					</div>
					<div className="flex justify-end gap-2 mt-4">
						<button className="btn px-4 py-2 rounded-lg border border-[#222737] text-[#e8ecf8] bg-transparent" onClick={() => setShowModal(false)}>Cancelar</button>
						<button className="btn primary px-4 py-2 rounded-lg border border-[#6ea8fe] text-[#e8ecf8] bg-[#2b3347]" onClick={handleModalApply}>Adicionar selecionados</button>
					</div>
				</DialogContent>
			</Dialog>
			{/* Modal de confirmação de exclusão de treino */}
			<Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirmar exclusão</DialogTitle>
					</DialogHeader>
					{workout && (
						<div className="space-y-2">
							<div>Tem certeza que deseja excluir o treino <strong>{workout.name}</strong>?</div>
						</div>
					)}
					{deleteError && <div className="text-red-500 text-sm mt-2">{deleteError}</div>}
					<div className="flex gap-2 mt-4">
						<button
							className="btn danger px-4 py-2 rounded-lg border border-[#ff5d6c] text-[#ffc7cd] bg-[#2b3347]"
							onClick={handleConfirmDeleteWorkout}
							disabled={deleteLoading}
						>
							{deleteLoading ? 'Excluindo...' : 'Confirmar'}
						</button>
						<button
							className="btn px-4 py-2 rounded-lg border border-[#222737] text-[#e8ecf8] bg-transparent"
							onClick={() => setShowDeleteModal(false)}
							disabled={deleteLoading}
						>
							Cancelar
						</button>
					</div>
				</DialogContent>
			</Dialog>
			{/* MODAL DE DETALHES DA SESSÃO */}
			{selectedSession && (
  <Dialog open={!!selectedSession} onOpenChange={open => !open && setSelectedSession(null)}>
    <DialogContent style={{ maxWidth: 480 }}>
      <DialogHeader>
        <DialogTitle>Detalhes da Execução</DialogTitle>
      </DialogHeader>
      <div>
        <div><b>Início:</b> {new Date(selectedSession.startedAt).toLocaleString()}</div>
        <div><b>Status:</b> {selectedSession.status.toString() === "Finished" ? "Finalizado" : selectedSession.status.toString() === "InProgress" ? "Em progresso" : "Cancelado"}</div>
        {selectedSession.endedAt && <div><b>Fim:</b> {new Date(selectedSession.endedAt).toLocaleString()}</div>}
        <div style={{ marginTop: 12 }}>
          <b>Exercícios:</b>
          <ul style={{ paddingLeft: 16 }}>
            {selectedSession.exercises.map((ex, idx) => (
              <li key={idx}>
                {ex.metadata.name} - {ex.repetitions ? `${ex.repetitions} reps` : ""} {ex.weight ? `${ex.weight} ${ex.measureUnit.toString() === "Kilogram" ? "kg" : "lb"}` : ""}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DialogContent>
  </Dialog>
)}
		</div>
	);
}

// ====== COMPONENTS ======
function WorkoutCard({ w, isPro, isClients, onSelect, clients, currentUserId }) {
  const firstMuscle = Array.isArray(w.exercises) && w.exercises.length > 0 && Array.isArray(w.exercises[0].muscleGroups) && w.exercises[0].muscleGroups.length > 0
    ? muscleGroupToPtBr(w.exercises[0].muscleGroups[0])
    : "";
  return (
    <div className={`card${w.creatorId == currentUserId && !isClients? " blue" : " gray"}`} onClick={() => onSelect(w.id)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div>
          <div style={{ fontWeight: 700 }}>{w.name}</div>
          <div className="meta"> Descanso: {fmtRest(w.restingTimeInSeconds)}</div>
        </div>
        <div className="meta">{firstMuscle}</div>
      </div>
    </div>
  );
}
function MuscleMap({ activeAreas }) {
  // Convert area ids to SVG ids (first letter lowercase)
  const ids = activeAreas.map(id => id.charAt(0).toLowerCase() + id.slice(1));
  const paintedSvg = paintSvgByIds(rawSvg, ids, "#4f82ff");
  return (
    <div dangerouslySetInnerHTML={{ __html: paintedSvg }} aria-label="Mapa muscular frontal" />
  );
}

function ExerciseList({ selected, onSelect, filter, exercises }) {
  const q = filter.q.trim().toLowerCase();
  const groups = filter.groups;
  const muscles = filter.muscles;

  // Expand selected groups to their muscles
  let selectedMuscles: MuscleGroup[] = [];
  groups.forEach(g => {
    selectedMuscles = selectedMuscles.concat(getRelatedMuscleGroups(g));
  });
  // Add directly selected muscles
  selectedMuscles = selectedMuscles.concat(Array.from(muscles));

  // Remove duplicates and convert
  const uniqueSelectedMuscles = Array.from(new Set(selectedMuscles)).map(String);

  // Build lookup: number (as string) -> text name
  const muscleGroupEnum = MuscleGroup;
  const muscleNumberToText: Record<string, string> = {};
  Object.keys(muscleGroupEnum)
    .filter(k => !isNaN(Number(k)))
    .forEach(num => {
      muscleNumberToText[num] = muscleGroupEnum[num];
    });

  // Map selected muscles (numbers as strings) to text names
  const selectedMuscleTexts = uniqueSelectedMuscles.map(num => muscleNumberToText[num]).filter(Boolean);

  const data = exercises.filter(ex => {
    // Search by name
    if (q && !ex.name.toLowerCase().includes(q)) return false;
    // If no muscle filter, show all
    if (selectedMuscleTexts.length === 0) return true;
    // Show if any muscle in ex.muscleGroups matches selected muscles
    const exMuscles = ex.muscleGroups ?? [];
    return exMuscles.some(m => selectedMuscleTexts.includes(m));
  });
  return (
    <>
      {data.length ? data.map(ex => {
        const ckd = selected.includes(ex.id);
        const muscleArr = ex.muscleGroups ?? [];
        return (
          <div key={ex.id} className="ex-item">
            <div>
              <div style={{ fontWeight: 600 }}>{ex.name}</div>
              <small>{muscleArr.map(muscleGroupToPtBr).filter(Boolean).join(" • ")}</small>
            </div>
            <input type="checkbox" className="check" checked={ckd} onChange={ev => onSelect(ex.id, ev.target.checked)} />
          </div>
        );
      }) : <div className="empty">Nenhum exercício encontrado.</div>}
    </>
  );
}
