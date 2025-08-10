require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'whatsapp';
const COLLECTION_NAME = 'processed_messages';

async function connectToDatabase() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client.db(DB_NAME);
}

function extractMessageData(payload) {
  const entry = payload.metaData.entry[0];
  const change = entry.changes[0];
  const value = change.value;

  if (value.messages) {
    // This is a message payload
    const message = value.messages[0];
    const contact = value.contacts[0];
    
    return {
      id: message.id,
      from: message.from,
      to: value.metadata.display_phone_number,
      timestamp: parseInt(message.timestamp),
      text: message.text?.body || '',
      type: message.type,
      contact_name: contact.profile.name,
      wa_id: contact.wa_id,
      status: 'sent', // Default status for new messages
      createdAt: new Date(payload.createdAt),
      isIncoming: message.from !== value.metadata.display_phone_number
    };
  }
  
  return null;
}

function extractStatusData(payload) {
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

async function processPayloads() {
  try {
    const db = await connectToDatabase();
    const collection = db.collection(COLLECTION_NAME);

    // Get all JSON files from data directory
    const dataDir = path.join(process.cwd(), 'Data');
    const files = await fs.readdir(dataDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    console.log(`Found ${jsonFiles.length} JSON files to process`);

    // Process message files first
    const messageFiles = jsonFiles.filter(file => file.includes('message'));
    const statusFiles = jsonFiles.filter(file => file.includes('status'));

    // Process messages
    for (const file of messageFiles) {
      const filePath = path.join(dataDir, file);
      const fileContent = await fs.readFile(filePath, 'utf8');
      const payload = JSON.parse(fileContent);

      const messageData = extractMessageData(payload);
      if (messageData) {
        // Check if message already exists
        const existing = await collection.findOne({ id: messageData.id });
        if (!existing) {
          await collection.insertOne(messageData);
          console.log(`Inserted message: ${messageData.id} from ${messageData.contact_name}`);
        } else {
          console.log(`Message ${messageData.id} already exists, skipping`);
        }
      }
    }

    // Process status updates
    for (const file of statusFiles) {
      const filePath = path.join(dataDir, file);
      const fileContent = await fs.readFile(filePath, 'utf8');
      const payload = JSON.parse(fileContent);

      const statusData = extractStatusData(payload);
      if (statusData) {
        // Update message status using messageId or metaMsgId
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
          console.log(`Updated status for message ${statusData.messageId} to ${statusData.status}`);
        } else {
          console.log(`No message found for status update: ${statusData.messageId}`);
        }
      }
    }

    console.log('✅ All payloads processed successfully!');
    console.log('\n📊 Database Summary:');
    
    const totalMessages = await collection.countDocuments();
    const conversations = await collection.distinct('wa_id');
    
    console.log(`Total messages: ${totalMessages}`);
    console.log(`Active conversations: ${conversations.length}`);
    
    for (const wa_id of conversations) {
      const messageCount = await collection.countDocuments({ wa_id });
      const contact = await collection.findOne({ wa_id }, { projection: { contact_name: 1 } });
      console.log(`- ${contact.contact_name} (${wa_id}): ${messageCount} messages`);
    }

  } catch (error) {
    console.error('Error processing payloads:', error);
  }
}

// Run the script
processPayloads().then(() => process.exit(0));