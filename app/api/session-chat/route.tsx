import connectToDatabase from "@/config/mongodb";
import SessionChat from "@/models/SessionChat";
import User from "@/models/User";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req:NextRequest){
    const {notes,selectedDoctor}=await req.json();
    const user=await currentUser()
    const emailAddress = user?.primaryEmailAddress?.emailAddress;
    
    if (!emailAddress) {
        return NextResponse.json({error: "unauthorized"}, {status: 401});
    }

    try {
        await connectToDatabase();

        // 1. Check and Deduct Credits
        const dbUser = await User.findOne({ email: emailAddress });
        
        if (!dbUser || dbUser.credits <= 0) {
            return NextResponse.json({ 
                error: "Insufficient Credits", 
                details: "You have run out of credits.Limit reached." 
            }, { status: 403 });
        }

        // Deduct 1 credit
        dbUser.credits -= 1;
        await dbUser.save();

        const sessionId=uuidv4();
        
        const newSession = await SessionChat.create({
            sessionId:sessionId,
            createdBy:emailAddress,
            notes:notes,
            selectedDoctor:selectedDoctor,
            createdOn:(new Date()).toString()
        });

        return NextResponse.json(newSession);
    } catch (e: any) {
        console.error("POST session-chat ERROR:", e);
        // Provide more detailed error response for debugging
        const message = e.message || "Database connection error";
        return NextResponse.json({ 
            error: message,
            details: "Check MongoDB Atlas IP whitelist and credentials."
        }, { status: 500 });
    }
}

export async function GET(req:NextRequest){
    try {
        await connectToDatabase();
        const {searchParams}=new URL(req.url);
        const sessionId=searchParams.get('sessionId');
        const user=await currentUser()
        const emailAddress = user?.primaryEmailAddress?.emailAddress;

        if (!emailAddress) {
            return NextResponse.json([]);
        }

        if(sessionId=='all'){
            const result = await SessionChat.find({ createdBy: emailAddress }).sort({ _id: -1 });
            return NextResponse.json(result);
        }
        else{
            const result = await SessionChat.findOne({ sessionId: sessionId });
            return NextResponse.json(result || null);
        }
    } catch (e: any) {
        console.error("GET session-chat ERROR:", e);
        const message = e.message || "Database connection error";
        return NextResponse.json({ 
            error: message,
            details: "Check MongoDB Atlas IP whitelist and credentials."
        }, { status: 500 });
    }
}