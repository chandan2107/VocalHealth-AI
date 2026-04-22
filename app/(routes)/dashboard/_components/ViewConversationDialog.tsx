'use client'
import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { sessionDetail } from '../medical-agent/[sessionId]/page'
import axios from 'axios'

type props={
    record:sessionDetail
}

function ViewConversationDialog({record}:props) {
  const [open, setOpen] = useState(false)
  const [conversation, setConversation] = useState<any[]>(Array.isArray((record as any)?.conversation) ? ((record as any)?.conversation as any[]) : [])
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    const load = async ()=>{
      if (!open) return
      if (Array.isArray(conversation) && conversation.length>0) return
      if (!record?.sessionId) return
      try{
        setLoading(true)
        const res = await axios.get(`/api/session-chat?sessionId=${record.sessionId}`)
        const data = res.data || {}
        const conv = Array.isArray(data?.conversation) ? data.conversation : []
        setConversation(conv)
      } finally{
        setLoading(false)
      }
    }
    load()
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant={'secondary'} size={'sm'}>View Conversation</Button>
      </DialogTrigger>
      <DialogContent className='max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle asChild>
            <h2 className='text-center text-2xl'>Conversation Transcript</h2>
          </DialogTitle>
          <DialogDescription asChild>
            <div className='mt-4 space-y-3'>
              {loading ? (
                <p className='text-center text-sm text-gray-500'>Loading...</p>
              ) : Array.isArray(conversation) && conversation.length>0 ? (
                conversation.map((m:any, idx:number)=>{
                  const role = m?.role || 'assistant'
                  const text = m?.text ?? m?.content ?? ''
                  return (
                  <div key={idx} className='p-3 rounded-md border'>
                    <p className='text-xs text-gray-500 mb-1'>{role==='assistant'?'Assistant':'User'}</p>
                    <p className='whitespace-pre-wrap leading-relaxed'>{text}</p>
                  </div>
                )})
              ) : (
                <p className='text-center text-sm text-gray-500'>No conversation available for this session.</p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default ViewConversationDialog


