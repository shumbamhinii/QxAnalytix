import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Edit, Trash2, Calendar, User, Folder } from 'lucide-react'; // Import Folder icon
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskForm, type TaskFormData } from './TaskForm';

interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  due_date?: string;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
  assignee?: string;
  project_id?: string | null;
  project_name?: string | null; // Added project_name
}

const priorityColors = {
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High: 'bg-red-50 text-red-700 border-red-200',
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void; // Changed to pass the full task object
  onDelete: (taskId: string) => void;
  priority: Task['priority'];
  progressPercentage: number;
  project_name?: string | null; // Added project_name to props
  // Add a prop to pass the projects list to TaskForm
  projects: { id: string; name: string; }[];
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  priority,
  progressPercentage,
  project_name, // Destructure project_name
  projects // Destructure projects prop
}: TaskCardProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.8 : 1,
  };

  const handleEditSave = (updatedFormTask: TaskFormData) => {
    // Call onEdit with the full task object, not just form data
    onEdit({
      ...task, // Preserve existing task properties
      title: updatedFormTask.title,
      description: updatedFormTask.description,
      priority: updatedFormTask.priority,
      assignee: updatedFormTask.assignee,
      due_date: updatedFormTask.due_date,
      progress_percentage: updatedFormTask.progress_percentage,
      project_id: updatedFormTask.project_id,
      // project_name will be updated by KanbanBoard after re-fetching
    });
    setShowEditForm(false);
  };

  const handleDeleteConfirm = () => {
    onDelete(task.id);
    setAlertOpen(false);
  };

  // This handler is specifically for the drag handle button.
  // It prevents the button's click from interfering with drag events or opening dialogs.
  const handleDragHandleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // This handler is for the Edit button. It opens the dialog and stops propagation.
  const handleEditButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling up to potentially draggable parent
    setShowEditForm(true);
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className="cursor-default"
      // Removed any direct onClick on motion.div to prevent accidental dialog opening during drag
    >
      <Card className="hover:shadow-lg transition-all duration-200 bg-white border border-gray-200 flex flex-col h-fit">
        <CardContent className="p-3 space-y-3 flex-1 flex flex-col">
          {/* Title and drag handle */}
          <div className="flex justify-between items-center gap-2">
            <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-5 flex-1">
              {task.title}
            </h4>

            {/* Drag handle only */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 cursor-grab"
              {...listeners} // Apply listeners to the drag handle
              {...attributes} // Apply attributes to the drag handle
              onClick={handleDragHandleClick} // Prevent click from propagating when dragging
              aria-label="Drag task"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {task.description && (
            <p className="text-xs text-gray-600 line-clamp-2 leading-4">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap gap-1">
            <Badge
              variant="outline"
              className={`text-xs font-medium border ${priorityColors[priority]}`}
            >
              {priority}
            </Badge>
            {project_name && (
              <Badge
                variant="outline"
                className="text-xs font-medium border bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1"
              >
                <Folder className="h-3 w-3" />
                {project_name}
              </Badge>
            )}
          </div>

          <div className="space-y-1 mt-auto">
            {task.due_date && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
              </div>
            )}
            {task.assignee && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <User className="h-3 w-3" />
                <span>{task.assignee}</span>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progress</span>
              <span className="font-medium text-gray-700">
                {progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-1 pt-1 border-t border-gray-100">
            {/* Edit Button - Directly controls Dialog state */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600"
              onClick={handleEditButtonClick} // Use the new handler
            >
              <Edit className="h-3 w-3" />
            </Button>

            {/* Edit Dialog - No longer uses DialogTrigger asChild on the button */}
            <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Task</DialogTitle>
                  <DialogDescription>Update your task details.</DialogDescription>
                </DialogHeader>
                <TaskForm
                  task={{
                    title: task.title,
                    description: task.description || '',
                    priority: task.priority,
                    assignee: task.assignee,
                    due_date: task.due_date,
                    progress_percentage: task.progress_percentage,
                    project_id: task.project_id, // Pass project_id
                  }}
                  onSave={handleEditSave}
                  onCancel={() => setShowEditForm(false)}
                  // Pass projects prop to TaskForm
                  projects={projects} // Pass the actual projects list here from KanbanBoard
                />
              </DialogContent>
            </Dialog>

            {/* Delete */}
            <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation(); // Stop propagation to prevent drag
                    setAlertOpen(true);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Task</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{task.title}"? This cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteConfirm}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
