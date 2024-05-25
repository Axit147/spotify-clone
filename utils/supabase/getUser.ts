export default async function getUser({supabase}: any){
    return await supabase?.auth.getUser()
}