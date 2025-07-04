"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
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
  GripVertical,
  Edit,
  User as UserIcon,
  Cloud,
  CloudOff,
} from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { AuthForm } from "@/components/auth-form";
import { AccountMenu } from "@/components/account-menu";
import { User, Set, Exercise, Workout, View } from "@/lib/types";

export default function WorkoutTracker() {
  const { data: session, status } = useSession();
  const [syncing, setSyncing] = useState(false);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [currentView, setCurrentView] = useState<View>("workouts");
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );
  const [newWorkoutName, setNewWorkoutName] = useState("");
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newSetWeight, setNewSetWeight] = useState("");
  const [newSetReps, setNewSetReps] = useState("");
  const [isWorkoutDialogOpen, setIsWorkoutDialogOpen] = useState(false);
  const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);
  const [isSetDialogOpen, setIsSetDialogOpen] = useState(false);

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
    }
  };

  const handleLogout = async () => {
    // Sync current workouts before logout
    if (session?.user && workouts.length > 0) {
      try {
        await fetch("/api/workouts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workouts }),
        });
        console.log("Final sync before logout completed");
      } catch (error) {
        console.error("Failed to sync before logout:", error);
      }
    }

    await signOut();
    setWorkouts([]);
    setCurrentView("workouts");
  };

  // Show loading screen
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth form if not logged in
  if (!session?.user) {
    return <AuthForm />;
  }

  // Convert session user to our User type
  const user: User = {
    id: session.user.email || "",
    name: session.user.name || "",
    email: session.user.email || "",
  };

  // Show account menu
  if (currentView === "account") {
    return (
      <AccountMenu
        user={user}
        onLogout={handleLogout}
        onBack={() => setCurrentView("workouts")}
      />
    );
  }

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
      try {
        await fetch("/api/workouts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workouts: updatedWorkouts }),
        });
        console.log("New workout saved immediately");
      } catch (error) {
        console.error("Failed to save new workout:", error);
      }
    }
  };

  const deleteWorkout = async (workoutId: string) => {
    const updatedWorkouts = workouts.filter((w) => w.id !== workoutId);
    setWorkouts(updatedWorkouts);

    // Immediately sync the deletion
    if (session?.user) {
      try {
        await fetch("/api/workouts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workouts: updatedWorkouts }),
        });
        console.log("Workout deletion saved immediately");
      } catch (error) {
        console.error("Failed to save workout deletion:", error);
      }
    }
  };

  const createExercise = () => {
    if (!newExerciseName.trim() || !selectedWorkout) return;

    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: newExerciseName,
      sets: [],
    };

    const updatedWorkouts = workouts.map((workout) =>
      workout.id === selectedWorkout.id
        ? { ...workout, exercises: [...workout.exercises, newExercise] }
        : workout,
    );

    setWorkouts(updatedWorkouts);
    setSelectedWorkout({
      ...selectedWorkout,
      exercises: [...selectedWorkout.exercises, newExercise],
    });
    setNewExerciseName("");
    setIsExerciseDialogOpen(false);
  };

  const deleteExercise = (exerciseId: string) => {
    if (!selectedWorkout) return;

    const updatedWorkouts = workouts.map((workout) =>
      workout.id === selectedWorkout.id
        ? {
            ...workout,
            exercises: workout.exercises.filter((e) => e.id !== exerciseId),
          }
        : workout,
    );

    setWorkouts(updatedWorkouts);
    setSelectedWorkout({
      ...selectedWorkout,
      exercises: selectedWorkout.exercises.filter((e) => e.id !== exerciseId),
    });
  };

  const createSet = () => {
    if (
      !newSetWeight.trim() ||
      !newSetReps.trim() ||
      !selectedExercise ||
      !selectedWorkout
    )
      return;

    const newSet: Set = {
      id: Date.now().toString(),
      weight: Number.parseFloat(newSetWeight),
      reps: Number.parseInt(newSetReps),
      timestamp: new Date(),
    };

    const updatedExercises = selectedWorkout.exercises.map((exercise) =>
      exercise.id === selectedExercise.id
        ? { ...exercise, sets: [...exercise.sets, newSet] }
        : exercise,
    );

    const updatedWorkouts = workouts.map((workout) =>
      workout.id === selectedWorkout.id
        ? { ...workout, exercises: updatedExercises }
        : workout,
    );

    setWorkouts(updatedWorkouts);
    setSelectedWorkout({ ...selectedWorkout, exercises: updatedExercises });
    setSelectedExercise({
      ...selectedExercise,
      sets: [...selectedExercise.sets, newSet],
    });
    setNewSetWeight("");
    setNewSetReps("");
    setIsSetDialogOpen(false);
  };

  const updateSet = (setId: string, weight: number, reps: number) => {
    if (!selectedExercise || !selectedWorkout) return;

    const updatedSets = selectedExercise.sets.map((set) =>
      set.id === setId ? { ...set, weight, reps } : set,
    );

    const updatedExercises = selectedWorkout.exercises.map((exercise) =>
      exercise.id === selectedExercise.id
        ? { ...exercise, sets: updatedSets }
        : exercise,
    );

    const updatedWorkouts = workouts.map((workout) =>
      workout.id === selectedWorkout.id
        ? { ...workout, exercises: updatedExercises }
        : workout,
    );

    setWorkouts(updatedWorkouts);
    setSelectedWorkout({ ...selectedWorkout, exercises: updatedExercises });
    setSelectedExercise({ ...selectedExercise, sets: updatedSets });
  };

  const deleteSet = (setId: string) => {
    if (!selectedExercise || !selectedWorkout) return;

    const updatedSets = selectedExercise.sets.filter((set) => set.id !== setId);

    const updatedExercises = selectedWorkout.exercises.map((exercise) =>
      exercise.id === selectedExercise.id
        ? { ...exercise, sets: updatedSets }
        : exercise,
    );

    const updatedWorkouts = workouts.map((workout) =>
      workout.id === selectedWorkout.id
        ? { ...workout, exercises: updatedExercises }
        : workout,
    );

    setWorkouts(updatedWorkouts);
    setSelectedWorkout({ ...selectedWorkout, exercises: updatedExercises });
    setSelectedExercise({ ...selectedExercise, sets: updatedSets });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === "workout") {
      const reorderedWorkouts = Array.from(workouts);
      const [removed] = reorderedWorkouts.splice(source.index, 1);
      reorderedWorkouts.splice(destination.index, 0, removed);
      setWorkouts(reorderedWorkouts);
    } else if (type === "exercise" && selectedWorkout) {
      const reorderedExercises = Array.from(selectedWorkout.exercises);
      const [removed] = reorderedExercises.splice(source.index, 1);
      reorderedExercises.splice(destination.index, 0, removed);

      const updatedWorkout = {
        ...selectedWorkout,
        exercises: reorderedExercises,
      };
      const updatedWorkouts = workouts.map((workout) =>
        workout.id === selectedWorkout.id ? updatedWorkout : workout,
      );

      setWorkouts(updatedWorkouts);
      setSelectedWorkout(updatedWorkout);
    }
  };

  const renderWorkoutsList = () => (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Workouts</h1>
          <div className="flex items-center mt-1">
            <span className="text-sm text-muted-foreground mr-2">
              Welcome, {user.name}
            </span>
            {syncing ? (
              <CloudOff className="w-4 h-4 text-muted-foreground animate-pulse" />
            ) : (
              <Cloud className="w-4 h-4 text-green-600" />
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={syncWorkouts}
            disabled={syncing}
            title="Sync workouts"
          >
            {syncing ? (
              <CloudOff className="w-4 h-4 animate-pulse" />
            ) : (
              <Cloud className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView("account")}
          >
            <UserIcon className="w-4 h-4" />
          </Button>
          <Dialog
            open={isWorkoutDialogOpen}
            onOpenChange={setIsWorkoutDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Workout
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Workout</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Workout name (e.g., Back and Shoulders)"
                  value={newWorkoutName}
                  onChange={(e) => setNewWorkoutName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createWorkout()}
                />
                <Button onClick={createWorkout} className="w-full">
                  Create Workout
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="workouts" type="workout">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
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
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div
                            className="flex-1"
                            onClick={() => {
                              setSelectedWorkout(workout);
                              setCurrentView("workout-detail");
                            }}
                          >
                            <h3 className="font-semibold">{workout.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {workout.exercises.length} exercise
                              {workout.exercises.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
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

      {workouts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No workouts yet</p>
          <p className="text-sm text-muted-foreground">
            Create your first workout to get started!
          </p>
        </div>
      )}
    </div>
  );

  const renderWorkoutDetail = () => (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentView("workouts")}
          className="mr-3"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold flex-1">{selectedWorkout?.name}</h1>
        <Dialog
          open={isExerciseDialogOpen}
          onOpenChange={setIsExerciseDialogOpen}
        >
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Exercise
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Exercise</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Exercise name (e.g., Pull Ups)"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createExercise()}
              />
              <Button onClick={createExercise} className="w-full">
                Create Exercise
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="exercises" type="exercise">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
            >
              {selectedWorkout?.exercises.map((exercise, index) => (
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
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div
                            className="flex-1"
                            onClick={() => {
                              setSelectedExercise(exercise);
                              setCurrentView("exercise-detail");
                            }}
                          >
                            <h3 className="font-semibold">{exercise.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {exercise.sets.length} set
                              {exercise.sets.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Exercise
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete &quot;
                                    {exercise.name}&quot;? This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteExercise(exercise.id)}
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

      {selectedWorkout?.exercises.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No exercises yet</p>
          <p className="text-sm text-muted-foreground">
            Add your first exercise to this workout!
          </p>
        </div>
      )}
    </div>
  );

  const renderExerciseDetail = () => (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentView("workout-detail")}
          className="mr-3"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold flex-1">{selectedExercise?.name}</h1>
        <Dialog open={isSetDialogOpen} onOpenChange={setIsSetDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
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
                <div>
                  <label className="text-sm font-medium">Weight</label>
                  <Input
                    type="number"
                    placeholder="20"
                    value={newSetWeight}
                    onChange={(e) => setNewSetWeight(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Reps</label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={newSetReps}
                    onChange={(e) => setNewSetReps(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={createSet} className="w-full">
                Add Set
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {selectedExercise?.sets.map((set, index) => (
          <SetCard
            key={set.id}
            set={set}
            index={index}
            onUpdate={(weight, reps) => updateSet(set.id, weight, reps)}
            onDelete={() => deleteSet(set.id)}
          />
        ))}
      </div>

      {selectedExercise?.sets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No sets yet</p>
          <p className="text-sm text-muted-foreground">
            Add your first set to track your progress!
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {currentView === "workouts" && renderWorkoutsList()}
      {currentView === "workout-detail" && renderWorkoutDetail()}
      {currentView === "exercise-detail" && renderExerciseDetail()}
    </div>
  );
}

function SetCard({
  set,
  index,
  onUpdate,
  onDelete,
}: {
  set: Set;
  index: number;
  onUpdate: (weight: number, reps: number) => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editWeight, setEditWeight] = useState(set.weight.toString());
  const [editReps, setEditReps] = useState(set.reps.toString());

  const handleSave = () => {
    const weight = Number.parseFloat(editWeight);
    const reps = Number.parseInt(editReps);
    if (!isNaN(weight) && !isNaN(reps)) {
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
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-muted-foreground">
              Set {index + 1}
            </span>
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={editWeight}
                  onChange={(e) => setEditWeight(e.target.value)}
                  className="w-16 h-8"
                />
                <span className="text-sm">lbs</span>
                <span className="text-muted-foreground">×</span>
                <Input
                  type="number"
                  value={editReps}
                  onChange={(e) => setEditReps(e.target.value)}
                  className="w-16 h-8"
                />
                <span className="text-sm">reps</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{set.weight} lbs</span>
                <span className="text-muted-foreground">×</span>
                <span className="font-semibold">{set.reps} reps</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost">
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
                      <AlertDialogAction onClick={onDelete}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xs text-muted-foreground">
            {set.timestamp.toLocaleDateString()} at{" "}
            {set.timestamp.toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
