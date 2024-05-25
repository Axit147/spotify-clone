import { Song } from "@/types";
import { createClient } from "@/utils/supabase/server";

const getSongs = async():Promise<Song[]>=>{
    const supabase = createClient()

    const {data, error} = await supabase
    .from('songs')
    .select('*')
    .order('created_at',{ascending:false});

    if(error){
        console.log(error)
    }

    return (data as any) || []

}

export default getSongs