import { Song } from "@/types";
import usePlayer from "./usePlayer";
import { useUser } from "./useUser";
import { useRouter } from "next/navigation";

const useOnPlay = (songs: Song[]) => {
  const player = usePlayer();
  const { user } = useUser();

  const router = useRouter();

  const onPlay = (id: string) => {
    if (!user) {
      return router.push("/auth/sign_in");
    }

    player.setId(id);
    player.setIds(songs.map((song) => song.id));
  };

  return onPlay;
};

export default useOnPlay;
