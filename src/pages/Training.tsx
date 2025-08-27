import React, { useState, useRef } from "react";
import "./training.css";

// ====== MOCK DATA ======
const currentUser = { id: "u1", name: "Você" };
const clients = [
	{ id: "c1", name: "Alan Edward" },
	{ id: "c2", name: "Alan BDS" },
];
const EX_GROUPS = [
	"Peitoral",
	"Braços",
	"Ombros",
	"Costas",
	"Abdômen",
	"Pernas",
	"Corpo Inteiro",
];
const EX_MUSCLES = [
	"Peitoral Superior",
	"Peitoral Médio",
	"Peitoral Inferior",
	"Tríceps",
	"Bíceps",
	"Deltoide Anterior",
	"Deltoide Lateral",
	"Deltoide Posterior",
	"Oblíquos",
	"Abdômen Superior",
	"Abdômen Inferior",
	"Quadríceps",
	"Panturrilhas",
];
const catalog = [
	{ id: "ex1", name: "Supino Reto", groups: ["Peitoral"], muscles: ["Peitoral Médio"] },
	{ id: "ex2", name: "Supino Inclinado", groups: ["Peitoral"], muscles: ["Peitoral Superior"] },
	{ id: "ex3", name: "Crucifixo com Halteres", groups: ["Peitoral"], muscles: ["Peitoral Médio", "Peitoral Superior"] },
	{ id: "ex4", name: "Flexão de Braço", groups: ["Corpo Inteiro", "Peitoral"], muscles: ["Peitoral Médio", "Tríceps", "Deltoide Anterior", "Abdômen Superior"] },
	{ id: "ex5", name: "Tríceps Corda", groups: ["Braços"], muscles: ["Tríceps"] },
	{ id: "ex6", name: "Rosca Direta", groups: ["Braços"], muscles: ["Bíceps"] },
	{ id: "ex7", name: "Elevação Lateral", groups: ["Ombros"], muscles: ["Deltoide Lateral"] },
	{ id: "ex8", name: "Prancha", groups: ["Abdômen", "Corpo Inteiro"], muscles: ["Abdômen Superior", "Abdômen Inferior", "Oblíquos"] },
	{ id: "ex9", name: "Agachamento Livre", groups: ["Pernas", "Corpo Inteiro"], muscles: ["Quadríceps", "Abdômen Inferior"] },
	{ id: "ex10", name: "Panturrilha em Pé", groups: ["Pernas"], muscles: ["Panturrilhas"] },
];
function uid() { return Math.random().toString(36).slice(2, 10); }
function fmtRest([m = 0, s = 0]) { return `${m || 0}m ${s || 0}s`; }
function ownerName(ownerId) {
	if (ownerId === currentUser.id) return "Você";
	const c = clients.find(c => c.id === ownerId);
	return c ? c.name : "—";
}
const MUSCLE_TO_AREAS = {
	"Peitoral Superior": ["area-peitoral-superior-esq", "area-peitoral-superior-dir"],
	"Peitoral Médio": ["area-peitoral-medio-esq", "area-peitoral-medio-dir"],
	"Peitoral Inferior": ["area-peitoral-medio-esq", "area-peitoral-medio-dir"],
	"Deltoide Anterior": ["area-deltoide-esq", "area-deltoide-dir"],
	"Deltoide Lateral": ["area-deltoide-esq", "area-deltoide-dir"],
	"Deltoide Posterior": ["area-deltoide-esq", "area-deltoide-dir"],
	"Tríceps": ["area-triceps-esq", "area-triceps-dir"],
	"Bíceps": ["area-biceps-esq", "area-biceps-dir"],
	"Abdômen Superior": ["area-abdomen-superior"],
	"Abdômen Inferior": ["area-abdomen-inferior"],
	"Oblíquos": ["area-obliquo-esq", "area-obliquo-dir"],
	"Quadríceps": ["area-quadriceps-esq", "area-quadriceps-dir"],
	"Panturrilhas": ["area-panturrilha-esq", "area-panturrilha-dir"],
};
function collectMuscleAreas(exerciseIds) {
	const set = new Set();
	exerciseIds.map(id => catalog.find(x => x.id === id)).filter(Boolean).forEach(ex => {
		ex.muscles.forEach(m => (MUSCLE_TO_AREAS[m] || []).forEach(a => set.add(a)));
	});
	return Array.from(set);
}
function byId(id) { return catalog.find(x => x.id === id); }
function isMine(w) { return w.owner === currentUser.id && w.createdBy === currentUser.id; }
function assignedToMe(w) { return w.owner === currentUser.id && w.createdBy !== currentUser.id; }
function isClientsMode(isPro, proTab) { return isPro && proTab === "clientes"; }

// ====== MAIN COMPONENT ======
export default function Training() {
	// State
	const [isPro, setIsPro] = useState(false);
	const [proTab, setProTab] = useState("meus");
	const [search, setSearch] = useState("");
	const [workouts, setWorkouts] = useState([
		{ id: "w1", name: "Treino de Peito", owner: currentUser.id, createdBy: currentUser.id, rest: [1, 0], exercises: ["ex1", "ex2"], history: [{ date: "15/08/2025", dur: "1h 11m", status: "Finalizado" }] },
		{ id: "w2", name: "Peito + Core (Coach)", owner: currentUser.id, createdBy: "coachX", rest: [0, 45], exercises: ["ex4", "ex8"], history: [{ date: "07/08/2025", dur: "42m", status: "Finalizado" }] },
		{ id: "w3", name: "Treino de Peitoral BDS", owner: "c2", createdBy: currentUser.id, rest: [1, 30], exercises: ["ex1"], history: [] },
	]);
	const [selectedWorkoutId, setSelectedWorkoutId] = useState(null);
	const [showForm, setShowForm] = useState(false);
	const [formMode, setFormMode] = useState("create");
	const [formData, setFormData] = useState({ name: "", restMin: 0, restSec: 0, client: clients[0]?.id || "", exercises: [] });
	const [showModal, setShowModal] = useState(false);
	const [modalSelected, setModalSelected] = useState([]);
	const [modalFilter, setModalFilter] = useState({ q: "", groups: new Set(), muscles: new Set() });

	// Derived
	const isClients = isClientsMode(isPro, proTab);
	let filteredWorkouts = workouts.filter(w => {
		if (isClients) return clients.some(c => c.id === w.owner);
		return w.owner === currentUser.id;
	}).filter(w => w.name.toLowerCase().includes(search.toLowerCase()));

	// Group by client if pro/clients mode
	let groupedWorkouts = null;
	if (isClients) {
		groupedWorkouts = clients.map(client => ({
			client,
			workouts: filteredWorkouts.filter(w => w.owner === client.id)
		})).filter(g => g.workouts.length);
	}

	// Selected workout
	const workout = workouts.find(w => w.id === selectedWorkoutId);

	// ====== Handlers ======
	function handleRoleSwitch(e) {
		setIsPro(e.target.checked);
		setProTab("meus");
		setSelectedWorkoutId(null);
		setShowForm(false);
	}
	function handleTab(tab) {
		setProTab(tab);
		setSelectedWorkoutId(null);
		setShowForm(false);
	}
	function handleSearch(e) {
		setSearch(e.target.value);
	}
	function handleClearSearch() {
		setSearch("");
	}
	function handleSelectWorkout(id) {
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
			restMin: workout.rest[0],
			restSec: workout.rest[1],
			client: workout.owner,
			exercises: workout.exercises,
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
	function handleFormChange(e) {
		const { name, value } = e.target;
		setFormData(fd => ({ ...fd, [name]: value }));
	}
	function handleFormExerciseRemove(id) {
		setFormData(fd => ({ ...fd, exercises: fd.exercises.filter(x => x !== id) }));
	}
	function handleFormSubmit(e) {
		e.preventDefault();
		const data = {
			name: formData.name.trim() || "Treino",
			rest: [Number(formData.restMin || 0), Number(formData.restSec || 0)],
			exercises: formData.exercises,
			owner: isClients ? (formData.client || clients[0]?.id) : currentUser.id,
			createdBy: currentUser.id,
			history: workout?.history || [],
		};
		if (formMode === "edit" && workout) {
			setWorkouts(ws => ws.map(w => w.id === workout.id ? { ...w, ...data } : w));
			setSelectedWorkoutId(workout.id);
			setShowForm(false);
		} else {
			const newW = { ...data, id: uid(), history: [] };
			setWorkouts(ws => [newW, ...ws]);
			setSelectedWorkoutId(newW.id);
			setShowForm(false);
		}
	}
	function handleOpenModal(selected) {
		setModalSelected(selected);
		setModalFilter({ q: "", groups: new Set(), muscles: new Set() });
		setShowModal(true);
	}
	function handleModalApply() {
		if (showForm) {
			setFormData(fd => ({ ...fd, exercises: modalSelected }));
		} else if (workout) {
			setWorkouts(ws => ws.map(w => w.id === workout.id ? { ...w, exercises: modalSelected } : w));
		}
		setShowModal(false);
	}
	function handleModalFilterChange(type, key) {
		setModalFilter(f => {
			const set = new Set(f[type]);
			set.has(key) ? set.delete(key) : set.add(key);
			return { ...f, [type]: set };
		});
	}
	function handleModalSearch(e) {
		setModalFilter(f => ({ ...f, q: e.target.value }));
	}
	function handleModalClearFilters() {
		setModalFilter({ q: "", groups: new Set(), muscles: new Set() });
	}
	function handleModalSelect(id, checked) {
		setModalSelected(sel => checked ? [...sel, id] : sel.filter(x => x !== id));
	}

	// ====== Render ======
	return (
		<div>
			<header>
				<h1>Treino — Web (Gerenciamento)</h1>
				<div className="role" title="Alternar modo do usuário">
					<span>{isPro ? "Usuário profissional" : "Usuário comum"}</span>
					<label className="switch">
						<input type="checkbox" checked={isPro} onChange={handleRoleSwitch} />
						<span className="slider"></span>
					</label>
				</div>
			</header>
			<div className="training-main">
				{/* LEFT COLUMN: LIST */}
				<section className="col">
					<h2>
						<span className="row"><strong>Meus Treinos</strong></span>
						<span className="row">
							{isPro && (
								<div className="tabs" style={{ display: "flex" }} role="tablist" aria-label="Tipo de lista">
									<button className="tab" role="tab" aria-selected={proTab === "meus"} onClick={() => handleTab("meus")}>Meus Treinos</button>
									<button className="tab" role="tab" aria-selected={proTab === "clientes"} onClick={() => handleTab("clientes")}>Meus Clientes</button>
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
						{isClients ? (
							groupedWorkouts && groupedWorkouts.length ? groupedWorkouts.map(g => (
								<React.Fragment key={g.client.id}>
									<div style={{ margin: "8px 6px 2px" }}>
										<div className="muted" style={{ fontWeight: 600 }}>{g.client.name}</div>
									</div>
									{g.workouts.map(w => (
										<WorkoutCard key={w.id} w={w} isPro={isPro} isClients={isClients} onSelect={handleSelectWorkout} />
									))}
								</React.Fragment>
							)) : <div className="empty">Nenhum treino encontrado.</div>
						) : (
							filteredWorkouts.length ? filteredWorkouts.map(w => (
								<WorkoutCard key={w.id} w={w} isPro={isPro} isClients={isClients} onSelect={handleSelectWorkout} />
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
										<div style={{ marginTop: 6 }}>{ownerName(workout?.owner)}</div>
									</div>
									<div>
										<label className="muted">Intervalo de descanso</label>
										<div style={{ marginTop: 6 }}>{fmtRest(workout?.rest || [0, 0])}</div>
									</div>
								</div>
							</div>
							{/* EXERCISES & HISTORY */}
							<div className="panel">
								<div className="row" style={{ justifyContent: "space-between" }}>
									<h3 style={{ margin: 0 }}>Exercícios</h3>
									<button className="btn" onClick={() => handleOpenModal(workout?.exercises || [])}>+ Adicionar exercícios</button>
								</div>
								<p className="muted" style={{ display: workout?.exercises?.length ? "none" : "block" }}>Nenhum exercício. Use “Adicionar exercícios”.</p>
								<div className="tags">
									{workout?.exercises?.map(exid => {
										const ex = byId(exid);
										return <span key={exid} className="pill"><span>{ex?.name}</span><span className="muted">• {ex?.muscles.join(", ")}</span></span>;
									})}
								</div>
								<hr style={{ border: 0, borderTop: "1px solid var(--stroke)", margin: "14px 0" }} />
								<h3>Execuções anteriores</h3>
								<div className="tags">
									{(workout?.history || []).map((h, i) => (
										<span key={i} className="pill"><span>{h.date}</span><span className="muted">• Duração: {h.dur} • {h.status}</span></span>
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
										const ex = byId(exid);
										return <span key={exid} className="pill"><span>{ex?.name}</span><span className="muted">• {ex?.muscles.join(", ")}</span><button type="button" className="rm" title="Remover" onClick={() => handleFormExerciseRemove(exid)}>x</button></span>;
									})}
								</div>
								<div style={{ height: 12 }}></div>
								<div className="row" style={{ justifyContent: "flex-end" }}>
									<button type="button" className="btn ghost" onClick={() => { showForm && workout ? setShowForm(false) : setShowForm(false); setSelectedWorkoutId(workout?.id || null); }}>Cancelar</button>
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
function WorkoutCard({ w, isPro, isClients, onSelect }) {
	const blue = (isPro && !isClients) || isMine(w);
	const gray = (!isPro && assignedToMe(w));
	return (
		<div className={`card${blue ? " blue" : ""}${gray ? " gray" : ""}`} onClick={() => onSelect(w.id)}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
				<div>
					<div style={{ fontWeight: 700 }}>{w.name}</div>
					<div className="meta">Dono: {ownerName(w.owner)} • Descanso: {fmtRest(w.rest)}</div>
				</div>
				<div className="meta">{byId(w.exercises[0])?.muscles?.[0] || ""}</div>
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
function ExerciseList({ selected, onSelect, filter }) {
	const q = filter.q.trim().toLowerCase();
	const groups = filter.groups;
	const muscles = filter.muscles;
	let data = catalog.filter(ex =>
		(!q || ex.name.toLowerCase().includes(q)) &&
		(!groups.size || ex.groups.some(g => groups.has(g))) &&
		(!muscles.size || ex.muscles.some(m => muscles.has(m)))
	);
	return (
		<>
			{data.length ? data.map(ex => {
				const ckd = selected.includes(ex.id);
				return (
					<div key={ex.id} className="ex-item">
						<div>
							<div style={{ fontWeight: 600 }}>{ex.name}</div>
							<small>{ex.groups.join(" • ")} • {ex.muscles.join(", ")}</small>
						</div>
						<input type="checkbox" className="check" checked={ckd} onChange={ev => onSelect(ex.id, ev.target.checked)} />
					</div>
				);
			}) : <div className="empty">Nenhum exercício encontrado.</div>}
		</>
	);
}
