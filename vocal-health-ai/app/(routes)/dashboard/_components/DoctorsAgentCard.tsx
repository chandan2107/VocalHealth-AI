"use client"
import { Button } from '@/components/ui/button'
import { IconArrowRight } from '@tabler/icons-react'
import Image from 'next/image'
import React, { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader } from 'lucide-react'
import { useContext } from 'react'
import { UserDetailCotext } from '@/context/UserDetailContext'


export type doctorAgent={
    id:number,
    specialist:string,
    description:string,
    image:string,
    agentPrompt:string,
    voiceId:string
}
type props={
    doctorAgent:doctorAgent
}
function DoctorsAgentCard({doctorAgent}:props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const {UserDetail, setUserDetail} = useContext(UserDetailCotext);

  const StartConsultation = async () => {
    if (UserDetail?.credits <= 0) {
      toast.error('You have run out of credits. Please upgrade your plan.');
      return;
    }

    setLoading(true);
    try {
      const result = await axios.post('/api/session-chat', {
        notes: '',
        selectedDoctor: doctorAgent
      });

      // Update local credits
      setUserDetail({
          ...UserDetail,
          credits: UserDetail.credits - 1
      });

      if (result.data?.sessionId) {
        router.push('/dashboard/medical-agent/' + result.data.sessionId);
      } else {
        toast.error('Failed to start consultation');
      }
    } catch (e: any) {
      console.error(e);
      if (e.response?.status === 403) {
        toast.error('Insufficient Credits: ' + (e.response?.data?.details || 'Please contact support.'));
      } else {
        toast.error('Failed to start consultation. Check your database connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Image src={doctorAgent.image} alt={doctorAgent.specialist} width={200} height={300} className='w-full h-[250px] object-cover rounded-xl '/>
      <h2 className='font-bold mt-1'>{doctorAgent.specialist}</h2>
      <p className='line-clamp-2 text-sm text-gray-500'>{doctorAgent.description}</p>
      <Button className='w-full mt-2' onClick={StartConsultation} disabled={loading}>
        {loading ? <Loader className='animate-spin mr-2' /> : null}
        Start Consultation <IconArrowRight/>
      </Button>
    </div>
  )
}

export default DoctorsAgentCard
