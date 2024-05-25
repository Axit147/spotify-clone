import { Song } from "@/types";
import { createClient } from "@/utils/supabase/server";

const getSongsByUserId = async():Promise<Song[]>=>{
    const supabase = createClient()

    const {data:{user},error:userError} = await supabase.auth.getUser()

    if(userError){
        console.log(userError.message)
        return[]
    }

    const {data, error} = await supabase.from('songs').select('*').eq('user_id', user?.id).order('created_at',{ascending: false});

    if(error){
        console.log(error.message)
    }

    return (data as any) || []

}

export default getSongsByUserId