"use client"
import { UserDetailCotext } from '@/context/UserDetailContext'
import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React, { useContext } from 'react'

const menuOptions=[
    {
        id:1,
        name:'Home',
        path:'/'
    },
    {
        id:2,
        name:'History',
        path:'/history'
    },
    {
        id:3,
        name:'Profile',
        path:'/dashboard/profile'
    },
]
function AppHeader() {
  const {UserDetail, setUserDetail} = useContext(UserDetailCotext);

  return (
    <div className='flex items-center justify-between p-4 shadow px-10 md:px-20 lg:px-40'>
     <Image src={'/logo.svg'} alt='logo' width={180} height={90} />

     <div className='hidden md:flex gap-12 items-center'>
        {menuOptions.map((option,index)=>(
            <Link key={index} href={option.path}>
                <h2 className='hover:font-bold cursor-pointer transition-all'>{option.name}</h2>
            </Link>
        ))}
     </div>
     <div className='flex gap-5 items-center'>
        
        <UserButton/>
     </div>

    </div>
  )
}

export default AppHeader
