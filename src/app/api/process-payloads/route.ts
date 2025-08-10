import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Message, WebhookPayload } from '@/types/message';
import fs from 'fs';
import path from 'path';

function extractMessageData(payload: WebhookPayload): Message | null {
  const entry = payload.metaData.entry[0];
  const change = entry.changes[0];
  const value = change.value;

  if (value.messages) {
    const message = value.messages[0];
    const contact = value.contacts?.[0];
    
    if (!contact) return null;

    return {
      id: message.id,
      from: message.from,
      to: value.metadata.display_phone_number,
      timestamp: parseInt(message.timestamp),
      text: message.text?.body || '',
      type: message.type as any,
      contact_name: contact.profile.name,
      wa_id: contact.wa_id,
      status: 'sent',
      createdAt: new Date(payload.createdAt),
      isIncoming: message.from !== value.metadata.display_phone_number
    };
  }
  
  return null;
}

function extractStatusData(payload: WebhookPayload) {
  const entry = payload.metaData.entry[0];
  const change = entry.changes[0];
  const value = change.value;

  if (value.statuses) {
    const status = value.statuses[0];
    return {
      messageId: status.id,
      metaMsgId: status.meta_msg_id,
      status: status.status,
      timestamp: parseInt(status.timestamp),
      recipientId: status.recipient_id
    };
  }
  
  return null;
}

export async function POST() {
  try {
    const db = await getDatabase();
    const collection = db.collection<Message>('processed_messages');

    // Get all JSON files from Data directory
    const dataDir = path.join(process.cwd(), 'Data');
    
    if (!fs.existsSync(dataDir)) {
      return NextResponse.json({ error: 'Data directory not found' }, { status: 404 });
    }

    const files = fs.readdirSync(dataDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    const messageFiles = jsonFiles.filter(file => file.includes('message'));
    const statusFiles = jsonFiles.filter(file => file.includes('status'));

    let processedMessages = 0;
    let updatedStatuses = 0;

    // Process messages
    for (const file of messageFiles) {
      const filePath = path.join(dataDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const payload: WebhookPayload = JSON.parse(fileContent);

      const messageData = extractMessageData(payload);
      if (messageData) {
        const existing = await collection.findOne({ id: messageData.id });
        if (!existing) {
          await collection.insertOne(messageData);
          processedMessages++;
        }
      }
    }

    // Process status updates
    for (const file of statusFiles) {
      const filePath = path.join(dataDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const payload: WebhookPayload = JSON.parse(fileContent);

      const statusData = extractStatusData(payload);
      if (statusData) {
        const updateQuery = {
          $or: [
            { id: statusData.messageId },
            { id: statusData.metaMsgId }
          ]
        };

        const updateResult = await collection.updateOne(
          updateQuery,
          {
            $set: {
              status: statusData.status,
              statusTimestamp: statusData.timestamp
            }
          }
        );

        if (updateResult.matchedCount > 0) {
          updatedStatuses++;
        }
      }
    }

    const totalMessages = await collection.countDocuments();
    const conversations = await collection.distinct('wa_id');

    return NextResponse.json({
      success: true,
      processedMessages,
      updatedStatuses,
      totalMessages,
      conversationsCount: conversations.length
    });

  } catch (error) {
    console.error('Error processing payloads:', error);
    return NextResponse.json({ error: 'Failed to process payloads' }, { status: 500 });
  }
}