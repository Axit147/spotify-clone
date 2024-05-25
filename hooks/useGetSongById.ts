import { toast } from "@/components/ui/use-toast"
import { Song } from "@/types"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useMemo, useState } from "react"


const useGetSongById = (id?: string) =>{
    const [isLoading, setIsLoading] = useState(false)
    const [song,setSong] = useState<Song | undefined>(undefined)
    const supabase = createClient()

    useEffect(() => {

        if(!id){
            return;
        }

        setIsLoading(true)

        const fetchSong = async() => {
            const {data,error} = await supabase
            .from('songs')
            .select('*')
            .eq('id',id)
            .single()

            if(error){
                setIsLoading(false)
                return toast({
                    variant: 'destructive',
                    title: 'Somethin went wrong!',
                    description: error.message
                })
            }

            setSong(data as Song)
            setIsLoading(false)
        }

        fetchSong()
    },[id,supabase])

    return useMemo(()=>({
        isLoading,
        song
    }),[isLoading,song])
}

export default useGetSongById