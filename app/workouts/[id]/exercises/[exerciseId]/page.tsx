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
  Check,
  X,
  GripVertical,
} from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Exercise, Workout, Set } from "@/lib/types";

export default function ExerciseDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const workoutId = params.id as string;
  const exerciseId = params.exerciseId as string;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [newSetWeight, setNewSetWeight] = useState("");
  const [newSetReps, setNewSetReps] = useState("");
  const [isSetDialogOpen, setIsSetDialogOpen] = useState(false);

  const loadWorkoutAndExercise = useCallback(async () => {
    try {
      const response = await fetch("/api/workouts");
      if (response.ok) {
        const data = await response.json();
        const foundWorkout = data.workouts.find((w: Workout) => w.id === workoutId);
        if (foundWorkout) {
          // Convert timestamp strings back to Date objects
          const workoutWithDates = {
            ...foundWorkout,
            exercises: foundWorkout.exercises.map((ex: Exercise) => ({
              ...ex,
              sets: ex.sets.map((set: Set) => ({
                ...set,
                timestamp: new Date(set.timestamp),
              })),
            })),
          };
          setWorkout(workoutWithDates);

          const foundExercise = workoutWithDates.exercises.find((e: Exercise) => e.id === exerciseId);
          if (foundExercise) {
            setExercise(foundExercise);
          } else {
            router.push(`/workouts/${workoutId}`);
          }
        } else {
          router.push("/workouts");
        }
      }
    } catch (error) {
      console.error("Load workout and exercise error:", error);
      router.push("/workouts");
    }
  }, [workoutId, exerciseId, router]);

  useEffect(() => {
    if (session?.user && workoutId && exerciseId) {
      loadWorkoutAndExercise();
    }
  }, [session, workoutId, exerciseId, loadWorkoutAndExercise]);

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

  const createSet = () => {
    if (
      !newSetWeight.trim() ||
      !newSetReps.trim() ||
      !exercise ||
      !workout
    )
      return;

    const newSet: Set = {
      id: Date.now().toString(),
      weight: Number.parseFloat(newSetWeight),
      reps: Number.parseInt(newSetReps),
      timestamp: new Date(),
    };

    const updatedExercise = {
      ...exercise,
      sets: [...exercise.sets, newSet],
    };

    const updatedWorkout = {
      ...workout,
      exercises: workout.exercises.map((ex) =>
        ex.id === exercise.id ? updatedExercise : ex
      ),
    };

    setExercise(updatedExercise);
    setWorkout(updatedWorkout);
    setNewSetWeight("");
    setNewSetReps("");
    setIsSetDialogOpen(false);
    updateWorkout(updatedWorkout);
  };

  const updateSet = (setId: string, weight: number, reps: number) => {
    if (!exercise || !workout) return;

    const updatedSets = exercise.sets.map((set) =>
      set.id === setId ? { ...set, weight, reps } : set
    );

    const updatedExercise = { ...exercise, sets: updatedSets };

    const updatedWorkout = {
      ...workout,
      exercises: workout.exercises.map((ex) =>
        ex.id === exercise.id ? updatedExercise : ex
      ),
    };

    setExercise(updatedExercise);
    setWorkout(updatedWorkout);
    updateWorkout(updatedWorkout);
  };

  const deleteSet = (setId: string) => {
    if (!exercise || !workout) return;

    const updatedSets = exercise.sets.filter((set) => set.id !== setId);
    const updatedExercise = { ...exercise, sets: updatedSets };

    const updatedWorkout = {
      ...workout,
      exercises: workout.exercises.map((ex) =>
        ex.id === exercise.id ? updatedExercise : ex
      ),
    };

    setExercise(updatedExercise);
    setWorkout(updatedWorkout);
    updateWorkout(updatedWorkout);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !exercise || !workout) return;

    const items = Array.from(exercise.sets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedExercise = { ...exercise, sets: items };
    const updatedWorkout = {
      ...workout,
      exercises: workout.exercises.map((ex) =>
        ex.id === exercise.id ? updatedExercise : ex
      ),
    };

    setExercise(updatedExercise);
    setWorkout(updatedWorkout);
    updateWorkout(updatedWorkout);
  };

  if (!workout || !exercise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading exercise...</div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-3">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{exercise.name}</h1>
          <p className="text-sm text-muted-foreground">{workout.name}</p>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="sets">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3 mb-6"
            >
              {exercise.sets.map((set, index) => (
                <Draggable key={set.id} draggableId={set.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <SetCard
                        set={set}
                        index={index}
                        onUpdate={(weight, reps) => updateSet(set.id, weight, reps)}
                        onDelete={() => deleteSet(set.id)}
                        dragHandleProps={provided.dragHandleProps}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Dialog open={isSetDialogOpen} onOpenChange={setIsSetDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Set
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Set</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Weight"
                type="number"
                value={newSetWeight}
                onChange={(e) => setNewSetWeight(e.target.value)}
              />
              <Input
                placeholder="Reps"
                type="number"
                value={newSetReps}
                onChange={(e) => setNewSetReps(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsSetDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={createSet}>Add Set</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SetCard({
  set,
  index,
  onUpdate,
  onDelete,
  dragHandleProps,
}: {
  set: Set;
  index: number;
  onUpdate: (weight: number, reps: number) => void;
  onDelete: () => void;
  dragHandleProps: object | null;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editWeight, setEditWeight] = useState(set.weight.toString());
  const [editReps, setEditReps] = useState(set.reps.toString());

  const handleSave = () => {
    const weight = Number.parseFloat(editWeight);
    const reps = Number.parseInt(editReps);
    if (!Number.isNaN(weight) && !Number.isNaN(reps)) {
      onUpdate(weight, reps);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditWeight(set.weight.toString());
    setEditReps(set.reps.toString());
    setIsEditing(false);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div {...dragHandleProps} className="cursor-grab">
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>
            <span className="text-sm text-muted-foreground min-w-[30px]">
              {index + 1}
            </span>
            {isEditing ? (
              <div className="flex items-center space-x-2 flex-1">
                <Input
                  value={editWeight}
                  onChange={(e) => setEditWeight(e.target.value)}
                  type="number"
                  className="w-20"
                  placeholder="Weight"
                />
                <span className="text-sm">lbs ×</span>
                <Input
                  value={editReps}
                  onChange={(e) => setEditReps(e.target.value)}
                  type="number"
                  className="w-16"
                  placeholder="Reps"
                />
              </div>
            ) : (
              <div className="flex-1">
                <span className="font-medium">
                  {set.weight} lbs × {set.reps} reps
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <Button variant="ghost" size="sm" onClick={handleSave}>
                  <Check className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Set</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this set? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={onDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
