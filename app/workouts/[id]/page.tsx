"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
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
  ArrowLeft,
  Edit,
  GripVertical,
} from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Exercise, Workout, Set } from "@/lib/types";

export default function WorkoutDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const workoutId = params.id as string;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editExerciseName, setEditExerciseName] = useState("");

  const loadWorkout = useCallback(async () => {
    try {
      const response = await fetch("/api/workouts");
      if (response.ok) {
        const data = await response.json();
        const foundWorkout = data.workouts.find((w: Workout) => w.id === workoutId);
        if (foundWorkout) {
          // Convert timestamp strings back to Date objects
          const workoutWithDates = {
            ...foundWorkout,
            exercises: foundWorkout.exercises.map((exercise: Exercise) => ({
              ...exercise,
              sets: exercise.sets.map((set: Set) => ({
                ...set,
                timestamp: new Date(set.timestamp),
              })),
            })),
          };
          setWorkout(workoutWithDates);
        } else {
          router.push("/workouts");
        }
      }
    } catch (error) {
      console.error("Load workout error:", error);
      router.push("/workouts");
    }
  }, [workoutId, router]);

  useEffect(() => {
    if (session?.user && workoutId) {
      loadWorkout();
    }
  }, [session, workoutId, loadWorkout]);

  const updateWorkout = useCallback(async (updatedWorkout: Workout) => {
    if (!session?.user) return;

    try {
      // Get all workouts and update this one
      const response = await fetch("/api/workouts");
      if (response.ok) {
        const data = await response.json();
        const updatedWorkouts = data.workouts.map((w: Workout) =>
          w.id === updatedWorkout.id ? updatedWorkout : w
        );

        // Sync the updated workouts
        await fetch("/api/workouts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workouts: updatedWorkouts }),
        });
        console.log("Workout updated and synced");
      }
    } catch (error) {
      console.error("Failed to update workout:", error);
    }
  }, [session?.user]);

  const createExercise = () => {
    if (!newExerciseName.trim() || !workout) return;

    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: newExerciseName,
      sets: [],
    };

    const updatedWorkout = {
      ...workout,
      exercises: [...workout.exercises, newExercise],
    };

    setWorkout(updatedWorkout);
    setNewExerciseName("");
    setIsExerciseDialogOpen(false);
    updateWorkout(updatedWorkout);
  };

  const deleteExercise = (exerciseId: string) => {
    if (!workout) return;

    const updatedWorkout = {
      ...workout,
      exercises: workout.exercises.filter((e) => e.id !== exerciseId),
    };

    setWorkout(updatedWorkout);
    updateWorkout(updatedWorkout);
  };

  const updateExerciseName = (exerciseId: string, newName: string) => {
    if (!newName.trim() || !workout) return;

    const updatedWorkout = {
      ...workout,
      exercises: workout.exercises.map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, name: newName } : exercise
      ),
    };

    setWorkout(updatedWorkout);
    setEditingExerciseId(null);
    setEditExerciseName("");
    updateWorkout(updatedWorkout);
  };

  const startEditingExercise = (exercise: Exercise) => {
    setEditingExerciseId(exercise.id);
    setEditExerciseName(exercise.name);
  };

  const cancelEditingExercise = () => {
    setEditingExerciseId(null);
    setEditExerciseName("");
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !workout) return;

    const items = Array.from(workout.exercises);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedWorkout = { ...workout, exercises: items };
    setWorkout(updatedWorkout);
    updateWorkout(updatedWorkout);
  };

  if (!workout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading workout...</div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-3">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">{workout.name}</h1>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="exercises">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3 mb-6"
            >
              {workout.exercises.map((exercise, index) => (
                <Draggable
                  key={exercise.id}
                  draggableId={exercise.id}
                  index={index}
                >
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() =>
                        !editingExerciseId &&
                        router.push(`/workouts/${workout.id}/exercises/${exercise.id}`)
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
                            {editingExerciseId === exercise.id ? (
                              <Input
                                value={editExerciseName}
                                onChange={(e) =>
                                  setEditExerciseName(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    updateExerciseName(exercise.id, editExerciseName);
                                  }
                                  if (e.key === "Escape") {
                                    cancelEditingExercise();
                                  }
                                }}
                                onBlur={() =>
                                  updateExerciseName(exercise.id, editExerciseName)
                                }
                                autoFocus
                                className="flex-1"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <div className="flex-1">
                                <h3 className="font-medium">{exercise.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {exercise.sets.length} sets
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
                                startEditingExercise(exercise);
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
                                  <AlertDialogTitle>Delete Exercise</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete &quot;{exercise.name}&quot;? This
                                    action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteExercise(exercise.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
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

      <Dialog open={isExerciseDialogOpen} onOpenChange={setIsExerciseDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Exercise
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Exercise</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Exercise name"
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createExercise()}
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsExerciseDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={createExercise}>Add Exercise</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
