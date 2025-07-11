"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Trash2,
  Edit,
  User as UserIcon,
  Cloud,
  CloudOff,
  GripVertical,
} from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Workout } from "@/lib/types";
import { FullPageLoading } from "@/components/ui/loading";

export default function WorkoutsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [newWorkoutName, setNewWorkoutName] = useState("");
  const [isWorkoutDialogOpen, setIsWorkoutDialogOpen] = useState(false);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [editWorkoutName, setEditWorkoutName] = useState("");

  // Load workouts when session changes
  useEffect(() => {
    if (session?.user) {
      loadWorkouts();
    }
  }, [session]);

  const syncWorkouts = useCallback(async () => {
    if (!session?.user) return;

    setSyncing(true);
    try {
      console.log("Syncing workouts...", workouts.length, "workouts");
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workouts }),
      });

      if (response.ok) {
        console.log("Workouts synced successfully");
      } else {
        console.error(
          "Failed to sync workouts:",
          response.status,
          response.statusText,
        );
      }
    } catch (error) {
      console.error("Sync workouts error:", error);
    } finally {
      setSyncing(false);
    }
  }, [session?.user, workouts]);

  // Auto-sync workouts when they change
  useEffect(() => {
    if (session?.user) {
      const timeoutId = setTimeout(() => {
        syncWorkouts();
      }, 1000); // Debounce saves

      return () => clearTimeout(timeoutId);
    }
  }, [workouts, session?.user, syncWorkouts]);

  const loadWorkouts = async () => {
    setLoading(true);
    try {
      console.log("Loading workouts...");
      const response = await fetch("/api/workouts");
      if (response.ok) {
        const data = await response.json();
        console.log("Loaded workouts:", data.workouts);
        // Convert timestamp strings back to Date objects
        const workoutsWithDates = data.workouts.map((workout: Workout) => ({
          ...workout,
          exercises: workout.exercises.map((exercise) => ({
            ...exercise,
            sets: exercise.sets.map((set) => ({
              ...set,
              timestamp: new Date(set.timestamp),
            })),
          })),
        }));
        setWorkouts(workoutsWithDates);
      } else {
        console.error(
          "Failed to load workouts:",
          response.status,
          response.statusText,
        );
      }
    } catch (error) {
      console.error("Load workouts error:", error);
    } finally {
      setLoading(false);
    }
  };

  const createWorkout = async () => {
    if (!newWorkoutName.trim()) return;

    const newWorkout: Workout = {
      id: Date.now().toString(),
      name: newWorkoutName,
      exercises: [],
    };

    const updatedWorkouts = [...workouts, newWorkout];
    setWorkouts(updatedWorkouts);
    setNewWorkoutName("");
    setIsWorkoutDialogOpen(false);

    // Immediately sync the new workout
    if (session?.user) {
      setCreating(true);
      try {
        await fetch("/api/workouts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workouts: updatedWorkouts }),
        });
        console.log("New workout synced");
      } catch (error) {
        console.error("Failed to sync new workout:", error);
      } finally {
        setCreating(false);
      }
    }
  };

  const deleteWorkout = async (workoutId: string) => {
    const updatedWorkouts = workouts.filter((w) => w.id !== workoutId);
    setWorkouts(updatedWorkouts);

    // Immediately sync the deletion
    if (session?.user) {
      setDeleting(workoutId);
      try {
        await fetch("/api/workouts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workouts: updatedWorkouts }),
        });
        console.log("Workout deletion synced");
      } catch (error) {
        console.error("Failed to sync workout deletion:", error);
      } finally {
        setDeleting(null);
      }
    }
  };

  const updateWorkoutName = async (workoutId: string, newName: string) => {
    if (!newName.trim()) return;

    const updatedWorkouts = workouts.map((workout) =>
      workout.id === workoutId ? { ...workout, name: newName } : workout,
    );

    setWorkouts(updatedWorkouts);
    setEditingWorkoutId(null);
    setEditWorkoutName("");

    // Immediately sync the update
    if (session?.user) {
      try {
        await fetch("/api/workouts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workouts: updatedWorkouts }),
        });
        console.log("Workout name update synced");
      } catch (error) {
        console.error("Failed to sync workout name update:", error);
      }
    }
  };

  const startEditingWorkout = (workout: Workout) => {
    setEditingWorkoutId(workout.id);
    setEditWorkoutName(workout.name);
  };

  const cancelEditingWorkout = () => {
    setEditingWorkoutId(null);
    setEditWorkoutName("");
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(workouts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWorkouts(items);
  };

  if (loading) return <FullPageLoading text="Loading workouts..." />;

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Workouts</h1>
        <div className="flex items-center space-x-2">
          {syncing ? (
            <CloudOff className="w-5 h-5 text-orange-500" />
          ) : (
            <Cloud className="w-5 h-5 text-green-500" />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/account")}
          >
            <UserIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="workouts">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3 mb-6"
            >
              {workouts.map((workout, index) => (
                <Draggable
                  key={workout.id}
                  draggableId={workout.id}
                  index={index}
                >
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() =>
                        !editingWorkoutId &&
                        router.push(`/workouts/${workout.id}`)
                      }
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab"
                            >
                              <GripVertical className="w-4 h-4 text-gray-400" />
                            </div>
                            {editingWorkoutId === workout.id ? (
                              <Input
                                value={editWorkoutName}
                                onChange={(e) =>
                                  setEditWorkoutName(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    updateWorkoutName(
                                      workout.id,
                                      editWorkoutName,
                                    );
                                  }
                                  if (e.key === "Escape") {
                                    cancelEditingWorkout();
                                  }
                                }}
                                onBlur={() =>
                                  updateWorkoutName(workout.id, editWorkoutName)
                                }
                                autoFocus
                                className="flex-1"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <div className="flex-1">
                                <h3 className="font-medium">{workout.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {workout.exercises.length} exercises
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditingWorkout(workout);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Workout
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete &quot;
                                    {workout.name}&quot;? This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteWorkout(workout.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {deleting === workout.id
                                      ? "Deleting..."
                                      : "Delete"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Dialog open={isWorkoutDialogOpen} onOpenChange={setIsWorkoutDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Workout
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Workout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Workout name"
              value={newWorkoutName}
              onChange={(e) => setNewWorkoutName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createWorkout()}
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsWorkoutDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={createWorkout}>
                {creating ? "Creating..." : "Add Workout"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
