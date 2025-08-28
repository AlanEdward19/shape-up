import React, { useState, useEffect } from "react";
import "./training.css";
import { TrainingService } from "@/services/trainingService";
import { ProfessionalManagementService } from "@/services/professionalManagementService";
import { MuscleGroup, exerciseResponse, workoutResponse, WorkoutVisibility } from "@/types/trainingService";
import { muscleGroupToPtBr, getMainMuscleGroups, getSecondaryMuscleGroups, getRelatedMuscleGroups } from "@/lib/muscleGroupUtils";

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
// MUSCLE_TO_AREAS: add all enum keys with empty arrays for missing ones
const MUSCLE_TO_AREAS: Record<MuscleGroup, string[]> = {
  [MuscleGroup.Chest]: [],
  [MuscleGroup.MiddleChest]: ["area-peitoral-medio-esq", "area-peitoral-medio-dir"],
  [MuscleGroup.UpperChest]: ["area-peitoral-superior-esq", "area-peitoral-superior-dir"],
  [MuscleGroup.LowerChest]: [],
  [MuscleGroup.Arms]: [],
  [MuscleGroup.Triceps]: ["area-triceps-esq", "area-triceps-dir"],
  [MuscleGroup.Biceps]: ["area-biceps-esq", "area-biceps-dir"],
  [MuscleGroup.Forearms]: [],
  [MuscleGroup.Shoulders]: [],
  [MuscleGroup.DeltoidAnterior]: ["area-deltoide-esq", "area-deltoide-dir"],
  [MuscleGroup.DeltoidLateral]: ["area-deltoide-esq", "area-deltoide-dir"],
  [MuscleGroup.DeltoidPosterior]: ["area-deltoide-esq", "area-deltoide-dir"],
  [MuscleGroup.Back]: [],
  [MuscleGroup.Traps]: [],
  [MuscleGroup.UpperBack]: [],
  [MuscleGroup.MiddleBack]: [],
  [MuscleGroup.LowerBack]: [],
  [MuscleGroup.Lats]: [],
  [MuscleGroup.Abs]: [],
  [MuscleGroup.AbsUpper]: ["area-abdomen-superior"],
  [MuscleGroup.AbsLower]: ["area-abdomen-inferior"],
  [MuscleGroup.AbsObliques]: ["area-obliquo-esq", "area-obliquo-dir"],
  [MuscleGroup.Legs]: [],
  [MuscleGroup.Quadriceps]: ["area-quadriceps-esq", "area-quadriceps-dir"],
  [MuscleGroup.Hamstrings]: [],
  [MuscleGroup.Glutes]: [],
  [MuscleGroup.Calves]: ["area-panturrilha-esq", "area-panturrilha-dir"],
  [MuscleGroup.HipFlexors]: [],
  [MuscleGroup.FullBody]: [],
};
function collectMuscleAreas(exercises: exerciseResponse[]) {
  const set = new Set<string>();
  exercises.forEach(ex => {
    const muscleArr = ex.muscleGroups ?? [];
    muscleArr.forEach(m => (MUSCLE_TO_AREAS[m] || []).forEach(a => set.add(a)));
  });
  return Array.from(set);
}

// Define missing constants for muscle groups and filter chips
const EX_GROUPS = [
  "Peitoral", "Costas", "Pernas", "Braços", "Abdômen", "Ombros", "Glúteos", "Panturrilhas"
];
const EX_MUSCLES = [
  "Peitoral Superior", "Peitoral Médio", "Tríceps", "Bíceps", "Deltoide Anterior", "Deltoide Lateral", "Deltoide Posterior", "Abdômen Superior", "Abdômen Inferior", "Oblíquos", "Quadríceps", "Panturrilhas"
];

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
	const [modalFilter, setModalFilter] = useState({ q: "", groups: new Set<string>(), muscles: new Set<string>() });
	const [currentUserId, setCurrentUserId] = useState<string>("");

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
					return { client, workouts: ws };
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
		setSelectedWorkoutId(id);
		setShowForm(false);
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
		if (!window.confirm(`Excluir o treino “${workout.name}”?`)) return;
		setWorkouts(workouts.filter(w => w.id !== workout.id));
		setSelectedWorkoutId(null);
		setShowForm(false);
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
			} else {
				newWorkout = await TrainingService.createWorkout({
					...data,
					visibility: WorkoutVisibility.Private,
				});
			}
			setWorkouts(ws => [newWorkout!, ...ws]);
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
			// Update workout exercises via API
			TrainingService.updateWorkout(workout.id, {
				name: workout.name,
				restingTimeInSeconds: workout.restingTimeInSeconds,
				exercises: modalSelected,
				visibility: workout.visibility,
			}).then(updated => {
				setWorkouts(ws => ws.map(w => w.id === workout.id ? updated : w));
			});
		}
		setShowModal(false);
	}
	function handleModalFilterChange(type: string, key: string) {
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
	return (
		<div>
			<div className="training-main">
				{/* LEFT COLUMN: LIST */}
				<section className="col">
					<h2>
						<span className="row"><strong>Meus Treinos</strong></span>
						<span className="row">
							{isPro && (
								<div className="tabs" style={{ display: "flex" }} role="tablist" aria-label="Tipo de lista">
									<button className="tab" role="tab" aria-selected={proTab === "meus"} onClick={() => setProTab("meus")}>Meus Treinos</button>
									<button className="tab" role="tab" aria-selected={proTab === "clientes"} onClick={() => setProTab("clientes")}>Meus Clientes</button>
								</div>
							)}
							<button className="btn primary" onClick={handleNewWorkout}>+ Novo Treino</button>
						</span>
					</h2>
					<div className="search">
						<input value={search} onChange={handleSearch} placeholder="Pesquisar treino..." />
						<button className="btn ghost" onClick={handleClearSearch}>Limpar</button>
					</div>
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
					<div className="detail">
						<div className="head">
							<div className="row">
								<h2 style={{ padding: 0, border: 0, margin: 0 }}>
									{showForm ? (formMode === "edit" ? "Editar Treino" : "Criar Novo Treino") : (workout ? workout.name : "Selecione um treino à esquerda")}
								</h2>
							</div>
							<div className="row" style={{ display: showForm || !workout ? "none" : "flex" }}>
								<button className="btn" onClick={handleEditWorkout}>Editar</button>
								<button className="btn danger" onClick={handleDeleteWorkout}>Excluir</button>
							</div>
						</div>
						{/* DETAIL BODY */}
						<div className="body" style={{ display: showForm || !workout ? "none" : "grid" }}>
							{/* MAP & META */}
							<div className="panel">
								<h3>Mapa muscular (frente)</h3>
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
									<button className="btn" onClick={() => handleOpenModal(workout?.exercises.map(e => e.id) || [])}>+ Adicionar exercícios</button>
								</div>
								<p className="muted" style={{ display: workout?.exercises?.length ? "none" : "block" }}>Nenhum exercício. Use “Adicionar exercícios”.</p>
								<div className="tags">
									{workout?.exercises?.map(ex => (
										<span key={ex.id} className="pill"><span>{ex.name}</span></span>
									))}
								</div>
							</div>
						</div>
						{/* FORM BODY */}
						<div className="body" style={{ display: showForm ? "grid" : "none" }}>
							<form className="panel" onSubmit={handleFormSubmit}>
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
			{showModal && (
				<div className="modal-bg" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 100 }} onClick={() => setShowModal(false)}></div>
			)}
			<dialog open={showModal} style={{ zIndex: 101, position: "fixed", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}>
				<div className="modal-head">
					<strong>Selecionar Exercícios</strong>
					<button className="btn ghost" onClick={() => setShowModal(false)}>Fechar</button>
				</div>
				<div className="modal-body">
					<div className="filter-box">
						<input className="input" value={modalFilter.q} onChange={handleModalSearch} placeholder="Pesquisar exercício" />
						<h4>Filtrar por Agrupamento Muscular</h4>
						<div className="chips">
							{EX_GROUPS.map(g => (
								<button key={g} className="chip" data-active={modalFilter.groups.has(g)} onClick={() => handleModalFilterChange("groups", g)}>{g}</button>
							))}
						</div>
						<h4>Filtrar por Músculo</h4>
						<div className="chips">
							{EX_MUSCLES.map(m => (
								<button key={m} className="chip" data-active={modalFilter.muscles.has(m)} onClick={() => handleModalFilterChange("muscles", m)}>{m}</button>
							))}
						</div>
						<div style={{ height: 10 }}></div>
						<button className="btn ghost" type="button" onClick={handleModalClearFilters}>Limpar filtros</button>
					</div>
					<div className="exercise-list">
						<ExerciseList
							selected={modalSelected}
							onSelect={handleModalSelect}
							filter={modalFilter}
							exercises={exercises}
						/>
					</div>
				</div>
				<div className="modal-foot">
					<button className="btn ghost" onClick={() => setShowModal(false)}>Cancelar</button>
					<button className="btn primary" onClick={handleModalApply}>Adicionar selecionados</button>
				</div>
			</dialog>
		</div>
	);
}

// ====== COMPONENTS ======
function WorkoutCard({ w, isPro, isClients, onSelect, clients, currentUserId }) {
  const firstMuscle = Array.isArray(w.exercises) && w.exercises.length > 0 && Array.isArray(w.exercises[0].muscleGroups) && w.exercises[0].muscleGroups.length > 0
    ? muscleGroupToPtBr(w.exercises[0].muscleGroups[0])
    : "";
  return (
    <div className={`card${isPro && !isClients ? " blue" : ""}${!isPro && isClients ? " gray" : ""}`} onClick={() => onSelect(w.id)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div>
          <div style={{ fontWeight: 700 }}>{w.name}</div>
          <div className="meta">Dono: {ownerName(w.userId, clients, currentUserId)} • Descanso: {fmtRest(w.restingTimeInSeconds)}</div>
        </div>
        <div className="meta">{firstMuscle}</div>
      </div>
    </div>
  );
}
function MuscleMap({ activeAreas }) {
	// SVG from HTML, with React logic for active areas
	return (
		<svg viewBox="0 0 280 520" aria-label="Mapa muscular frontal">
			<ellipse cx="140" cy="60" rx="30" ry="38" className="area soft" />
			{/* Peitoral superior (L/R) */}
			<path id="area-peitoral-superior-esq" className={`area${activeAreas.includes("area-peitoral-superior-esq") ? " active" : ""}`} d="M90,120 C75,120 68,135 70,152 L120,150 L120,132 C112,124 102,120 90,120 Z" />
			<path id="area-peitoral-superior-dir" className={`area${activeAreas.includes("area-peitoral-superior-dir") ? " active" : ""}`} d="M190,120 C205,120 212,135 210,152 L160,150 L160,132 C168,124 178,120 190,120 Z" />
			{/* Peitoral médio (L/R) */}
			<path id="area-peitoral-medio-esq" className={`area${activeAreas.includes("area-peitoral-medio-esq") ? " active" : ""}`} d="M70,152 L120,150 L120,188 L82,188 C70,182 66,166 70,152 Z" />
			<path id="area-peitoral-medio-dir" className={`area${activeAreas.includes("area-peitoral-medio-dir") ? " active" : ""}`} d="M210,152 L160,150 L160,188 L198,188 C210,182 214,166 210,152 Z" />
			{/* Abdômen superior / inferior */}
			<rect id="area-abdomen-superior" className={`area${activeAreas.includes("area-abdomen-superior") ? " active" : ""}`} x="120" y="192" width="40" height="44" rx="6" />
			<rect id="area-abdomen-inferior" className={`area${activeAreas.includes("area-abdomen-inferior") ? " active" : ""}`} x="118" y="240" width="44" height="46" rx="6" />
			{/* Oblíquos (L/R) */}
			<path id="area-obliquo-esq" className={`area${activeAreas.includes("area-obliquo-esq") ? " active" : ""}`} d="M100,192 L118,192 L118,286 L96,272 C92,252 92,220 100,192 Z" />
			<path id="area-obliquo-dir" className={`area${activeAreas.includes("area-obliquo-dir") ? " active" : ""}`} d="M180,192 L162,192 L162,286 L184,272 C188,252 188,220 180,192 Z" />
			{/* Deltoides (L/R) */}
			<circle id="area-deltoide-esq" className={`area${activeAreas.includes("area-deltoide-esq") ? " active" : ""}`} cx="72" cy="150" r="22" />
			<circle id="area-deltoide-dir" className={`area${activeAreas.includes("area-deltoide-dir") ? " active" : ""}`} cx="208" cy="150" r="22" />
			{/* Bíceps (L/R) */}
			<rect id="area-biceps-esq" className={`area${activeAreas.includes("area-biceps-esq") ? " active" : ""}`} x="44" y="184" width="26" height="60" rx="12" />
			<rect id="area-biceps-dir" className={`area${activeAreas.includes("area-biceps-dir") ? " active" : ""}`} x="210" y="184" width="26" height="60" rx="12" />
			{/* Tríceps (L/R) */}
			<rect id="area-triceps-esq" className={`area${activeAreas.includes("area-triceps-esq") ? " active" : ""}`} x="30" y="244" width="26" height="56" rx="12" />
			<rect id="area-triceps-dir" className={`area${activeAreas.includes("area-triceps-dir") ? " active" : ""}`} x="224" y="244" width="26" height="56" rx="12" />
			{/* Quadríceps (L/R) */}
			<rect id="area-quadriceps-esq" className={`area${activeAreas.includes("area-quadriceps-esq") ? " active" : ""}`} x="110" y="296" width="34" height="96" rx="14" />
			<rect id="area-quadriceps-dir" className={`area${activeAreas.includes("area-quadriceps-dir") ? " active" : ""}`} x="136" y="296" width="34" height="96" rx="14" />
			{/* Panturrilhas (L/R) */}
			<rect id="area-panturrilha-esq" className={`area${activeAreas.includes("area-panturrilha-esq") ? " active" : ""}`} x="112" y="396" width="30" height="78" rx="12" />
			<rect id="area-panturrilha-dir" className={`area${activeAreas.includes("area-panturrilha-dir") ? " active" : ""}`} x="138" y="396" width="30" height="78" rx="12" />
		</svg>
	);
}
function ExerciseList({ selected, onSelect, filter, exercises }) {
	const q = filter.q.trim().toLowerCase();
	const groups = filter.groups;
	const muscles = filter.muscles;
	const data = exercises.filter(ex =>
		(!q || ex.name.toLowerCase().includes(q)) &&
		(!groups.size || (ex.muscleGroups ?? []).some(g => groups.has(g))) &&
		(!muscles.size || (ex.muscleGroups ?? []).some(m => muscles.has(m)))
	);
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
