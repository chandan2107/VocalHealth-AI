"use client"
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {useUser} from '@clerk/nextjs'
import { UserDetailCotext } from '@/context/UserDetailContext'
import { Loader2 } from 'lucide-react'

export type UserDetail={
  name:string,
  email:string,
  credits:number
}
function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

    const {user}=useUser();
    const [UserDetail,setUserDetail]=useState<any>();
    const [loading, setLoading] = useState(false);

    useEffect(()=>{
        user && CreateNewUser();
    },[user])

    const CreateNewUser=async ()=>{
        setLoading(true);
        try {
            const result=await axios.post('/api/users');
            setUserDetail(result.data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false);
        }
    }

  return (
    <UserDetailCotext.Provider value={{UserDetail,setUserDetail}}>
      {loading ? (
        <div className='flex items-center justify-center h-screen w-screen'>
            <Loader2 className='animate-spin text-blue-600 h-10 w-10' />
        </div>
      ) : children}
    </UserDetailCotext.Provider>
  )
}

export default Provider

