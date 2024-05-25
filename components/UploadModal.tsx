"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";
import { useUser } from "@/hooks/useUser";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { Input } from "./ui/input";
import Button from "./Button";
import { useToast } from "./ui/use-toast";
import uniqid from "uniqid";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import useUploadModal from "@/hooks/useUploadModal";

const UploadModal = () => {
  const [isLoading, setIsLoading] = useState(false);

  const uploadModal = useUploadModal();

  const { toast } = useToast();
  const supabase = createClient();
  const router = useRouter();
  const { user } = useUser();
  const { register, handleSubmit, reset } = useForm<FieldValues>({
    defaultValues: {
      author: "",
      title: "",
      song: null,
      image: null,
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    try {
      setIsLoading(true);

      const imageFile = values.image?.[0];
      const songFile = values.song?.[0];

      if (!user || !imageFile || !songFile) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your request.",
        });
        return;
      }

      const uniqueID = uniqid();

      // Upload song

      const { data: songData, error: songError } = await supabase.storage
        .from("songs")
        .upload(`song-${values.title}-${uniqueID}`, songFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (songError) {
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "Failed to upload song",
        });
        return;
      }

      // Upload image

      const { data: imageData, error: imageError } = await supabase.storage
        .from("images")
        .upload(`image-${values.title}-${uniqueID}`, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (imageError) {
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "Failed to upload image",
        });
        return;
      }

      const { error: supabaseError } = await supabase.from("songs").insert({
        user_id: user.id,
        title: values.title,
        author: values.author,
        image_path: imageData.path,
        song_path: songData.path,
      });

      if (supabaseError) {
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: supabaseError.message,
        });
        return;
      }

      router.refresh();
      setIsLoading(false);
      toast({
        title: "Song created.",
      });
      uploadModal.onClose();
      reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onChange = (open: boolean) => {
    if (!open) {
      uploadModal.onClose();
    }
  };

  return (
    <Dialog open={uploadModal.isOpen} onOpenChange={onChange}>
      <DialogContent className="bg-neutral-900">
        <DialogTitle>Add a song</DialogTitle>
        <DialogDescription>Upload an mp3 file</DialogDescription>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-y-4"
        >
          <Input
            id="title"
            disabled={isLoading}
            {...register("title", { required: true })}
            placeholder="Song title"
          />
          <Input
            id="author"
            disabled={isLoading}
            {...register("author", { required: true })}
            placeholder="Song author"
          />
          <div>
            <div className="pb-1">Select a song file</div>
            <Input
              id="song"
              type="file"
              disabled={isLoading}
              accept=".mp3"
              {...register("song", { required: true })}
            />
          </div>
          <div>
            <div className="pb-1">Select an image</div>
            <Input
              id="image"
              type="file"
              disabled={isLoading}
              accept="image/*"
              {...register("image", { required: true })}
            />
          </div>
          <Button disabled={isLoading} type="submit">
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;
