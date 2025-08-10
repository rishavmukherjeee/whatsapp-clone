import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Message } from '@/types/message';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wa_id = searchParams.get('wa_id');

    const db = await getDatabase();
    const collection = db.collection<Message>('processed_messages');

    if (wa_id) {
      // Get messages for specific conversation
      const messages = await collection
        .find({ wa_id })
        .sort({ timestamp: 1 })
        .toArray();
      
      return NextResponse.json(messages);
    } else {
      // Get all conversations with last message
      const pipeline = [
        {
          $sort: { timestamp: -1 }
        },
        {
          $group: {
            _id: '$wa_id',
            contact_name: { $first: '$contact_name' },
            lastMessage: { $first: '$$ROOT' },
            unreadCount: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ['$isIncoming', true] }, { $ne: ['$status', 'read'] }] },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          $sort: { 'lastMessage.timestamp': -1 }
        }
      ];

      const conversations = await collection.aggregate(pipeline).toArray();
      return NextResponse.json(conversations);
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, wa_id, contact_name } = body;

    if (!text || !wa_id || !contact_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from: '918329446654', // Business phone number
      to: wa_id,
      timestamp: Math.floor(Date.now() / 1000),
      text,
      type: 'text',
      contact_name,
      wa_id,
      status: 'sent',
      createdAt: new Date(),
      isIncoming: false
    };

    const db = await getDatabase();
    const collection = db.collection<Message>('processed_messages');
    
    await collection.insertOne(message);

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}