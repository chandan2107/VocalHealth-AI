"use client"
import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import moment from 'moment'
import ViewConversationDialog from '../dashboard/_components/ViewConversationDialog'
import ViewReportDialog from '../dashboard/_components/ViewReportDialog'
import { sessionDetail } from '../dashboard/medical-agent/[sessionId]/page'

function HistoryPage() {
  const [items, setItems] = useState<sessionDetail[]>([])
  const [filter, setFilter] = useState<string>('All')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{
    const load = async ()=>{
      try{
        setLoading(true)
        setError(null)
        const res = await axios.get('/api/session-chat?sessionId=all')
        setItems(res.data || [])
      } catch (e: any) {
        console.error("History fetch error:", e)
        setError(e.response?.data?.error || "Failed to load history. Please check your database connection.")
      } finally{
        setLoading(false)
      }
    }
    load()
  },[])

  const specialists = useMemo(()=>{
    const set = new Set<string>()
    items.forEach(i => { if (i?.selectedDoctor?.specialist) set.add(i.selectedDoctor.specialist) })
    return ['All', ...Array.from(set)]
  }, [items])

  const filtered = useMemo(()=>{
    if (filter === 'All') return items
    return items.filter(i => i?.selectedDoctor?.specialist === filter)
  }, [items, filter])

  return (
    <div className='px-6 md:px-10 lg:px-20 py-8'>
      <h1 className='text-2xl font-bold'>History</h1>
      <div className='mt-2 mb-6 flex items-center gap-3'>
        <p className='text-gray-500'>Your recent consultations and conversations</p>
        <div className='ml-auto'>
          <select className='border rounded-md px-2 py-1 text-sm' value={filter} onChange={e=>setFilter(e.target.value)}>
            {specialists.map((s, idx)=> <option key={idx} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className='flex justify-center p-12'>
          <p className='text-gray-400 animate-pulse text-lg'>Loading consultations...</p>
        </div>
      ) : error ? (
        <div className='p-8 border-2 border-red-100 bg-red-50 rounded-xl text-center text-red-600'>
          <p className='font-semibold'>Error Loading History</p>
          <p className='text-sm mt-1'>{error}</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {items.length === 0 ? (
            <div className='p-8 border-2 border-dashed rounded-xl text-center text-gray-500'>
              No previous conversations found.
            </div>
          ) : (
             filtered.map((rec, idx)=> (
                <div key={idx} className='p-4 border rounded-lg flex items-center justify-between'>
                  <div>
                    <p className='font-medium'>{rec.selectedDoctor?.specialist}</p>
                    <p className='text-sm text-gray-500 line-clamp-1'>{rec.notes}</p>
                    <p className='text-xs text-gray-400 mt-1'>{moment(new Date(rec.createdOn)).format('YYYY-MM-DD HH:mm')}</p>
                  </div>
                  <div className='flex gap-2'>
                    <ViewConversationDialog record={rec}/>
                    <ViewReportDialog record={rec}/>
                  </div>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  )
}

export default HistoryPage


