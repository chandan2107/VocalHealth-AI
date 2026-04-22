"use client"
import React, { useState } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowRight, Loader2 } from 'lucide-react'
import axios from 'axios'
import DoctorsAgentCard, { doctorAgent } from './DoctorsAgentCard'
import SuggestedDoctorCard from './SuggestedDoctorCard'
import { useRouter } from 'next/navigation'
import { useContext } from 'react'
import { UserDetailCotext } from '@/context/UserDetailContext'

function AddNewSessionDialog() {
    const [note,setNote]=useState <string>();
    const [loading,setLoading]=useState(false);
    const [suggestedDoctors,setSuggestedDoctors]=useState<doctorAgent[]>();
    const [selectedDoctor,setSelectedDoctor]=useState<doctorAgent>();
    const router=useRouter();
    const {UserDetail, setUserDetail} = useContext(UserDetailCotext);

    const OnClickNext=async ()=>{
      if (UserDetail?.credits <= 0) {
          return;
      }
      setLoading(true);

      const result=await axios.post('/api/suggest-doctors',{notes:note});

      console.log(result.data);
      setSuggestedDoctors(result.data);
      setLoading(false);
    }

    const onStartConsultation=async ()=>{
      //save all info to database
      setLoading(true);
      try {
        const result=await axios.post('/api/session-chat',{
          notes:note,
          selectedDoctor:selectedDoctor
        });
        
        // Update local context credits
        setUserDetail({
            ...UserDetail,
            credits: UserDetail.credits - 1
        });

        if(result.data?.sessionId){
            router.push('/dashboard/medical-agent/' + result.data.sessionId);
        }
      } catch (e: any) {
          console.error(e);
      } finally {
        setLoading(false);
      }
  }
  return (
    <Dialog>
  <DialogTrigger asChild>
    <Button className='mt-3' disabled={UserDetail?.credits <= 0}>
        {UserDetail?.credits <= 0 ? 'No Credits' : '+ Start a Consultation'}
    </Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add basic Details</DialogTitle>
      <DialogDescription asChild>
        {!suggestedDoctors ? <div>
            {UserDetail?.credits <= 0 && (
                <div className='p-2 bg-red-50 border border-red-200 text-red-600 rounded-md mb-2 text-xs text-center font-bold'>
                    You have 0 credits left. Please upgrade your plan to start a new consultation.
                </div>
            )}
            <h2>Add Symptoms or any Other Details</h2>
            <Textarea placeholder='Add Details Here...' className='h-[200px] mt-1'onChange={(e)=>setNote(e.target.value)}/>
        </div>:
        <div>
          <h2>Select the doctor</h2>
        <div className='grid grid-cols-3 gap-5'>  
          {/* // Suggested Doctors  */}
          {suggestedDoctors.map((doctor,index)=>(
            <SuggestedDoctorCard doctorAgent={doctor} key={index} setSelectedDoctor={()=>setSelectedDoctor(doctor)} 
            //@ts-ignore
            selectedDoctor={selectedDoctor}/>
          ))}
        </div>
        </div>}
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
        <DialogClose asChild>
            <Button variant={'outline'}>Cancel</Button>
        </DialogClose>
        
        {!suggestedDoctors ? <Button disabled={!note || loading || UserDetail?.credits <= 0}  onClick={()=>OnClickNext()}>Next
        {loading ? <Loader2 className='animate-spin'/>:<ArrowRight/>}
           </Button>
          :<Button disabled={loading || !selectedDoctor || UserDetail?.credits <= 0} onClick={()=>onStartConsultation()}>Start Consultation
          {loading ? <Loader2 className='animate-spin'/>:<ArrowRight/>}</Button>}
    </DialogFooter>
  </DialogContent>
</Dialog>
  )
}

export default AddNewSessionDialog;
