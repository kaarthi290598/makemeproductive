"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Folder, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { deleteNote } from "@/lib/actions/notesData";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type NotesCardProps = {
  note: {
    id: number;
    title: string;
    notes: string;
    created_at: string;
    category?: { id: number; category: string };
  };
};

const NotesCard: React.FC<{ note: NotesCardProps["note"] }> = ({ note }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { mutate: deleteNoteMutate, isPending: isDeleting } = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      toast.success("Note deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setDeleteDialogOpen(false);
    },
    onError: (err: Error) => {
      toast.error(`Error deleting note: ${err.message}`);
    },
  });

  const handleEdit = () => {
    router.push(`/app/notes/edit/${note.id}`);
  };

  const handleDelete = () => {
    deleteNoteMutate(note.id);
  };

  return (
    <>
      <Card className="group flex h-fit flex-col rounded-2xl border border-border/60 bg-card/95 shadow-sm backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-lg">
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-1 flex-1 text-lg font-semibold tracking-tight">
              {note.title}
            </CardTitle>
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={handleEdit}
                aria-label="Edit note"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
                aria-label="Delete note"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <CardDescription className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Calendar className="h-3 w-3 opacity-70" />
              {format(new Date(note.created_at), "dd MMM yyyy, HH:mm")}
            </CardDescription>
            {note.category && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
              >
                <Folder className="h-3 w-3" />
                {note.category.category}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground/90">
            {note.notes.replace(/<[^>]*>?/gm, "")}
          </p>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{note.title}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotesCard;
