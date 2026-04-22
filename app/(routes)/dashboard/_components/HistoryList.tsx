"use client"
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import AddNewSessionDialog from './AddNewSessionDialog';

import axios from 'axios';
import HistoryTable from './HistoryTable';
import { sessionDetail } from '../medical-agent/[sessionId]/page';
import { Loader2 } from 'lucide-react';

function HistoryList() {
    const [HistoryList,setHistoryList]=useState<sessionDetail[]>([]);
    const [loading,setLoading]=useState(false);
    

    useEffect(()=>{
      GetHistoryList();
    },[])
    const GetHistoryList=async ()=>{
      setLoading(true);
      try {
        const result=await axios.get('/api/session-chat?sessionId=all');
        console.log(result.data)
        setHistoryList(result.data);
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false);
      }
    }
  return (
    <div className='mt-10' >
    {loading ? 
      <div className='flex items-center justify-center p-20'>
          <Loader2 className='animate-spin h-8 w-8 text-blue-600' />
      </div>
    : HistoryList.length==0?
    <div className='flex items-center flex-col justify-center p-7 border-2 border-dashed rounded-2xl '>
        <Image src={'/medical-assistance.png'} alt='empty' width={150} height={150} />
        <h2 className='font-bold text-xl mt-2'>No Recent Consultations</h2>
        <p>it looks like you havent't consulted with any doctors yet.</p>
        <AddNewSessionDialog/>
    </div>
    : <div>
      <HistoryTable HistoryList={HistoryList}/>
    </div>

    }
    </div>
  )
}

export default HistoryList
