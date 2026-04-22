"use client"
import React, { useContext, useEffect, useState } from 'react'
import { UserButton, useUser } from '@clerk/nextjs'
import { Calendar, MessageSquare, Users, TrendingUp } from 'lucide-react'
import axios from 'axios'
import { UserDetailCotext } from '@/context/UserDetailContext'

type ConsultationStats = {
  totalConsultations: number
  lastConsultation: string
  assistantUsage: {
    [specialist: string]: {
      count: number
    }
  }
}

function ProfilePage() {
  const { user } = useUser()
  const { UserDetail } = useContext(UserDetailCotext) || {}
  const [stats, setStats] = useState<ConsultationStats>({
    totalConsultations: 0,
    lastConsultation: 'No consultations yet',
    assistantUsage: {}
  })

  useEffect(() => {
    const loadFromApi = async () => {
      try{
        const res = await axios.get('/api/session-chat?sessionId=all')
        const sessions = Array.isArray(res.data) ? res.data : []
        const totalConsultations = sessions.length
        const last = sessions
          .map((s:any)=>s.createdOn)
          .filter(Boolean)
          .sort((a:any,b:any)=> new Date(b).getTime() - new Date(a).getTime())[0]
          || 'No consultations yet'
        const usage:Record<string,{count:number}> = {}
        sessions.forEach((s:any)=>{
          const spec = s?.selectedDoctor?.specialist || 'Unknown'
          usage[spec] = { count: (usage[spec]?.count || 0) + 1 }
        })
        setStats({
          totalConsultations,
          lastConsultation: last,
          assistantUsage: usage as any
        } as ConsultationStats)
      }catch(e){
        // ignore for now
      }
    }
    loadFromApi()
  }, [])

  const formatDate = (dateString: string) => {
    if (dateString === 'No consultations yet') return dateString
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header & User Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <UserButton className="h-16 w-16"/>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Hello, {UserDetail?.name || user?.fullName || 'User'}</h1>
                <p className="text-gray-600">Track your medical consultation history</p>
              </div>
            </div>
          </div>

          {/* Inline user details */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-md bg-gray-50">
              <p className="text-gray-500">Name</p>
              <p className="font-medium text-gray-900">{UserDetail?.name || user?.fullName || '—'}</p>
            </div>
            <div className="p-3 rounded-md bg-gray-50">
              <p className="text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{UserDetail?.email || user?.primaryEmailAddress?.emailAddress || '—'}</p>
            </div>
            
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Consultations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalConsultations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Consultation</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(stats.lastConsultation)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Most Used Assistant</p>
                <p className="text-sm font-medium text-gray-900">
                  {Object.keys(stats.assistantUsage).length > 0 
                    ? Object.entries(stats.assistantUsage).sort((a, b) => b[1].count - a[1].count)[0][0]
                    : 'None'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Assistant Usage Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Assistant Usage Breakdown</h2>
          <div className="space-y-4">
            {Object.keys(stats.assistantUsage).length > 0 ? (
              Object.entries(stats.assistantUsage)
                .sort((a, b) => b[1].count - a[1].count)
                .map(([specialist, data]) => (
                  <div key={specialist} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{specialist}</p>
                        <p className="text-sm text-gray-600">{data.count} consultations</p>
                      </div>
                    </div>
                    <div className="text-right" />
                  </div>
                ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No consultation data available yet</p>
                <p className="text-sm text-gray-500">Start your first consultation to see statistics here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
