<!-- YouTube Demo -->
<p align="center">
  <a href="https://youtu.be/Suy5ZpGdd1g" target="_blank">
    <img src="https://img.youtube.com/vi/Suy5ZpGdd1g/maxresdefault.jpg" alt="WhatsApp Web Clone Demo" style="border-radius:12px;max-width:100%;box-shadow:0 2px 8px rgba(0,0,0,0.15);">
  </a>
  <br>
  <a href="https://youtu.be/Suy5ZpGdd1g" target="_blank"><b>▶️ Watch Demo on YouTube</b></a>
</p>

# WhatsApp Web Clone

A beautiful full-stack WhatsApp Web clone built with Next.js, TypeScript, MongoDB, and Tailwind CSS. This app processes WhatsApp Business API webhook payloads and displays them in a WhatsApp-like interface.

## Features

- 📱 **Responsive Design**: Desktop & mobile friendly
- 💬 **Real-time Chat UI**: WhatsApp-like bubbles, timestamps, and status ticks
- ✅ **Perfect WhatsApp Ticks**: Sent, delivered, and read indicators
- 😀 **Emoji Picker**: Add emojis to your messages
- 📊 **Webhook Processing**: Handles WhatsApp Business API payloads
- 🗄️ **MongoDB Integration**: Stores messages and conversations
- 🔍 **Search Conversations**: Quickly find chats
- 📤 **Send Messages**: Compose and send (stored locally)

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB Atlas
- **Deployment**: Vercel (recommended)

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- Git

### 2. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd whatsapp-clone

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### 3. Environment Configuration

Create a `.env.local` file with:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
MONGODB_DB=whatsapp
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

### 4. Database Setup

1. Create a MongoDB Atlas cluster
2. Add your IP address to the Network Access list
3. Create a database user with read/write permissions
4. Copy the connection string to your `.env.local` file

### 5. Sample Data Setup

1. Create a `Data` folder in the project root
2. Copy all the sample JSON payload files to the `Data` folder:
   - `conversation_1_message_1.json`
   - `conversation_1_message_2.json`  
   - `conversation_1_status_1.json`
   - `conversation_1_status_2.json`
   - `conversation_2_message_1.json`
   - `conversation_2_message_2.json`
   - `conversation_2_status_1.json`
   - `conversation_2_status_2.json`

### 6. Run the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

Visit `http://localhost:3000` to see the application.

### 7. Processing Webhook Payloads

1. Click the "Process Payloads" button in the sidebar
2. This will read all JSON files from the `Data` folder and insert them into MongoDB
3. Messages and status updates will be processed automatically

## API Endpoints

### GET `/api/messages`
- Get all conversations (without `wa_id` parameter)
- Get messages for specific conversation (with `wa_id` parameter)

### POST `/api/messages`
Send a new message
```json
{
  "text": "Hello!",
  "wa_id": "919937320320",
  "contact_name": "Ravi Kumar"
}
```

### POST `/api/process-payloads`
Process all webhook payload files from the `Data` directory

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── messages/route.ts
│   │   └── process-payloads/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── chat/
│       ├── ChatSidebar.tsx
│       ├── ChatWindow.tsx
│       └── MobileLayout.tsx
├── lib/
│   └── mongodb.ts
└── types/
    └── message.ts
```

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `MONGODB_DB`
4. Deploy!

### Other Hosting Providers

The app can be deployed on:
- Heroku
- Railway
- DigitalOcean App Platform  
- AWS Amplify
- Netlify

Make sure to:
1. Add environment variables
2. Upload the `Data` folder with sample JSON files
3. Ensure MongoDB Atlas allows connections from your hosting provider's IPs

## Usage

1. **Load Sample Data**: Click "Process Payloads" to load sample conversations
2. **Browse Conversations**: Click on any conversation in the sidebar
3. **Send Messages**: Type in the message box and press Enter or click Send
4. **Mobile Experience**: The app is fully responsive and works on mobile devices

## Features Implemented

✅ **Task 1**: Webhook payload processor with MongoDB integration  
✅ **Task 2**: WhatsApp Web-like interface with conversations and messages  
✅ **Task 3**: Send message functionality (demo/storage only)  
✅ **Task 4**: Deployment ready (Vercel recommended)  
✅ **Responsive Design**: Works on mobile and desktop  
✅ **Message Status**: Sent/delivered/read indicators  
✅ **Search**: Search through conversations  
✅ **Real-time UI**: Automatic updates when sending messages  

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is for educational/demonstration purposes.