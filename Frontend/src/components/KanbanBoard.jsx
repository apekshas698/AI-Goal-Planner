// src/components/KanbanBoard.jsx
// npm install @hello-pangea/dnd

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import API from "../services/api";

const COLUMNS = [
  { id: "TODO",        label: "📋 Todo",       color: "#6c757d", bg: "#f8f9fa", border: "#dee2e6", badge: "#6c757d" },
  { id: "IN_PROGRESS", label: "⚡ In Progress", color: "#fd7e14", bg: "#fff8f0", border: "#ffc078", badge: "#fd7e14" },
  { id: "DONE",        label: "✅ Done",        color: "#28a745", bg: "#f0fff4", border: "#84e0a3", badge: "#28a745" },
];

function EmptyState({ icon, text }) {
  return (
    <div style={{ textAlign:"center", padding:"48px 20px", color:"#aaa", border:"2px dashed #e0e0e0", borderRadius:"12px" }}>
      <p style={{ fontSize:"32px", margin:"0 0 8px" }}>{icon}</p>
      <p style={{ fontSize:"15px" }}>{text}</p>
    </div>
  );
}

export default function KanbanBoard() {
  const [goals, setGoals]                   = useState([]);
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [columns, setColumns]               = useState({ TODO:[], IN_PROGRESS:[], DONE:[] });
  const [loading, setLoading]               = useState(false);

  useEffect(() => {
    API.get("/goals").then((res) => {
      setGoals(res.data);
      if (res.data.length > 0) setSelectedGoalId(String(res.data[0].id));
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedGoalId) return;
    setLoading(true);
    API.get("/tasks/goal/" + selectedGoalId).then((res) => {
      const grouped = { TODO:[], IN_PROGRESS:[], DONE:[] };
      res.data.forEach((task) => {
        const col = task.kanbanStatus && grouped[task.kanbanStatus] !== undefined
          ? task.kanbanStatus
          : task.completed ? "DONE" : "TODO";
        grouped[col].push(task);
      });
      setColumns(grouped);
    }).catch(console.error).finally(() => setLoading(false));
  }, [selectedGoalId]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    const src  = source.droppableId;
    const dest = destination.droppableId;

    const srcList  = [...columns[src]];
    const destList = src === dest ? srcList : [...columns[dest]];

    const [moved] = srcList.splice(source.index, 1);
    const updated  = { ...moved, kanbanStatus: dest, completed: dest === "DONE" };
    destList.splice(destination.index, 0, updated);

    setColumns(
      src === dest
        ? { ...columns, [src]: destList }
        : { ...columns, [src]: srcList, [dest]: destList }
    );

    try {
      await API.patch("/tasks/" + Number(draggableId) + "/status", {
        kanbanStatus: dest,
        completed: dest === "DONE",
      });
    } catch (err) {
      console.error("Failed to save:", err);
      // Rollback: re-fetch from server on failure
      API.get("/tasks/goal/" + selectedGoalId).then((res) => {
        const grouped = { TODO:[], IN_PROGRESS:[], DONE:[] };
        res.data.forEach((task) => {
          const col =
            task.kanbanStatus && grouped[task.kanbanStatus] !== undefined
              ? task.kanbanStatus
              : task.completed ? "DONE" : "TODO";
          grouped[col].push(task);
        });
        setColumns(grouped);
      });
    }
  };

  const totalTasks  = Object.values(columns).flat().length;
  const doneTasks   = columns.DONE.length;
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div style={{ marginTop:"32px" }}>

      {/* Header */}
      <div style={{
        display:"flex", justifyContent:"space-between", alignItems:"center",
        flexWrap:"wrap", gap:"12px", marginBottom:"20px"
      }}>
        <div>
          <h2 style={{ margin:0, fontSize:"22px" }}>🗂 Kanban Board</h2>
          <p style={{ margin:"4px 0 0", color:"#888", fontSize:"13px" }}>
            Drag tasks between columns to track progress
          </p>
        </div>
        <select
          value={selectedGoalId}
          onChange={(e) => setSelectedGoalId(e.target.value)}
          style={{
            padding:"8px 14px", borderRadius:"8px", border:"1px solid #ccc",
            fontSize:"14px", minWidth:"200px", cursor:"pointer"
          }}
        >
          <option value="">-- Select a Goal --</option>
          {goals.map((g) => (
            <option key={g.id} value={g.id}>{g.title}</option>
          ))}
        </select>
      </div>

      {/* Progress bar */}
      {selectedGoalId && totalTasks > 0 && (
        <div style={{ marginBottom:"20px" }}>
          <div style={{
            display:"flex", justifyContent:"space-between",
            fontSize:"13px", color:"#666", marginBottom:"6px"
          }}>
            <span>{doneTasks} of {totalTasks} tasks done</span>
            <span style={{ fontWeight:"bold", color:"#28a745" }}>{progressPct}%</span>
          </div>
          <div style={{ height:"8px", background:"#eee", borderRadius:"4px", overflow:"hidden" }}>
            <div style={{
              height:"100%",
              width: progressPct + "%",
              background:"linear-gradient(90deg,#6f42c1,#28a745)",
              borderRadius:"4px",
              transition:"width 0.4s ease"
            }} />
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color:"#888", fontStyle:"italic", textAlign:"center" }}>⏳ Loading tasks...</p>
      ) : !selectedGoalId ? (
        <EmptyState icon="🎯" text="Select a goal to see its Kanban board" />
      ) : totalTasks === 0 ? (
        <EmptyState icon="📭" text="No tasks found for this goal" />
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"16px", alignItems:"start" }}>
            {COLUMNS.map((col) => (
              <div
                key={col.id}
                style={{
                  background: col.bg,
                  border: "1.5px solid " + col.border,
                  borderRadius: "12px",
                }}
              >
                {/* Column header */}
                <div style={{
                  padding:"14px 16px",
                  borderBottom:"1.5px solid " + col.border,
                  display:"flex", justifyContent:"space-between", alignItems:"center"
                }}>
                  <span style={{ fontWeight:"700", fontSize:"14px", color:col.color }}>
                    {col.label}
                  </span>
                  <span style={{
                    background: col.badge, color:"white", borderRadius:"12px",
                    padding:"2px 10px", fontSize:"12px", fontWeight:"bold"
                  }}>
                    {columns[col.id].length}
                  </span>
                </div>

                {/* Droppable zone — key prop added here */}
                <Droppable droppableId={col.id} key={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        padding:"12px",
                        minHeight:"200px",
                        borderRadius:"0 0 12px 12px",
                        background: snapshot.isDraggingOver ? col.border + "66" : "transparent",
                        transition:"background 0.15s ease",
                      }}
                    >
                      {columns[col.id].map((task, index) => (
                        <Draggable
                          key={String(task.id)}
                          draggableId={String(task.id)}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                marginBottom:"8px",
                                padding:"12px 14px",
                                background:"white",
                                border: snapshot.isDragging
                                  ? "2px solid " + col.color
                                  : "1px solid #e8e8e8",
                                borderRadius:"8px",
                                boxShadow: snapshot.isDragging
                                  ? "0 8px 20px rgba(0,0,0,0.15)"
                                  : "0 1px 3px rgba(0,0,0,0.06)",
                                cursor: snapshot.isDragging ? "grabbing" : "grab",
                                userSelect:"none",
                              }}
                            >
                              <div style={{ display:"flex", alignItems:"flex-start", gap:"8px" }}>
                                <span style={{ fontSize:"15px", flexShrink:0, marginTop:"1px" }}>
                                  {col.id === "DONE" ? "✅" : col.id === "IN_PROGRESS" ? "⚡" : "📌"}
                                </span>
                                <span style={{
                                  fontSize:"13.5px",
                                  color: col.id === "DONE" ? "#999" : "#333",
                                  textDecoration: col.id === "DONE" ? "line-through" : "none",
                                  lineHeight:"1.45",
                                }}>
                                  {task.taskName}
                                </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}

                      {provided.placeholder}

                      {columns[col.id].length === 0 && !snapshot.isDraggingOver && (
                        <div style={{
                          textAlign:"center", color:"#ccc",
                          fontSize:"13px", padding:"24px 0", fontStyle:"italic"
                        }}>
                          Drop tasks here
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>

              </div>
            ))}
          </div>
        </DragDropContext>
      )}
    </div>
  );
}