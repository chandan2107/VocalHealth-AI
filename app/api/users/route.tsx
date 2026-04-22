import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectToDatabase from "@/config/mongodb";
import User from "@/models/User";

export async function POST(req:NextRequest){
    const user=await currentUser();
    if (!user) return NextResponse.json({error: "Unauthorized"}, {status: 401});

    try{
        await connectToDatabase();
        
        // check if user already exists
        let dbUser = await User.findOne({ email: user.primaryEmailAddress?.emailAddress });
        
        // if not then create new user
        if(!dbUser){
            dbUser = await User.create({
                name: user.fullName ?? "",
                email: user.primaryEmailAddress?.emailAddress ?? "",
                credits: 5
            });
        }
        
        return NextResponse.json(dbUser);
    }
    catch(e: any){
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}