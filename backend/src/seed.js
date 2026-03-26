import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/user.model.js";
import Group from "./models/group.model.js";
import Message from "./models/message.model.js";

dotenv.config();

const users = [
  { firstName: "Arjun",  lastName: "Sharma", email: "arjun@demo.com",  bio: "Full-stack developer | Coffee addict ☕",        profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=ArjunSharma&backgroundColor=b6e3f4" },
  { firstName: "Priya",  lastName: "Mehta",  email: "priya@demo.com",  bio: "UI/UX Designer | Making things pretty ✨",        profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaMehta&backgroundColor=ffdfbf" },
  { firstName: "Rohan",  lastName: "Gupta",  email: "rohan@demo.com",  bio: "DevOps Engineer | Cloud enthusiast ☁️",           profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=RohanGupta&backgroundColor=c0aede" },
  { firstName: "Sneha",  lastName: "Patel",  email: "sneha@demo.com",  bio: "Data Scientist | ML & AI enthusiast 🤖",          profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=SnehaPatel&backgroundColor=d1f4d9" },
  { firstName: "Karan",  lastName: "Singh",  email: "karan@demo.com",  bio: "Mobile Developer | React Native 📱",              profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=KaranSingh&backgroundColor=ffd5dc" },
  { firstName: "Aisha",  lastName: "Khan",   email: "aisha@demo.com",  bio: "Backend Engineer | Node.js & Go 🦫",              profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=AishaKhan&backgroundColor=b6e3f4" },
  { firstName: "Vikram", lastName: "Nair",   email: "vikram@demo.com", bio: "Tech Lead | Building scalable systems 🏗️",        profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=VikramNair&backgroundColor=ffdfbf" },
  { firstName: "Kavya",  lastName: "Reddy",  email: "kavya@demo.com",  bio: "Product Manager | Turning ideas to reality 💡",   profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=KavyaReddy&backgroundColor=c0aede" },
];

const sampleMessages = [
  "Hey! How's it going? 👋",
  "Just finished that project we talked about 🎉",
  "Can we hop on a call later?",
  "Saw your PR, looks great! 👏",
  "Coffee later? ☕",
  "Did you check the latest deployment?",
  "Working on something exciting, will share soon!",
  "Great work on the presentation today",
  "Any updates on the sprint?",
  "Let's sync up tomorrow morning",
  "The bug is finally fixed! 🐛✅",
  "Happy Friday! Have a great weekend 🎉",
  "Just pushed the changes, LGTM!",
  "Team lunch tomorrow? 🍕",
  "Check out this cool article I found 📖",
];

const groupData = [
  { name: "Dev Squad 🚀",    description: "Where code meets coffee. Daily standups and tech talks!" },
  { name: "Design Talk 🎨",  description: "UI/UX discussions, design reviews, and inspiration" },
  { name: "Weekend Vibes 🎮", description: "Gaming, movies, and weekend plans" },
  { name: "Project Alpha ⚡", description: "Main project coordination and updates" },
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Delete old seeded data
    const emails = users.map((u) => u.email);
    const oldUsers = await User.find({ email: { $in: emails } });
    const oldUserIds = oldUsers.map((u) => u._id);

    await Message.deleteMany({ senderId: { $in: oldUserIds } });
    await Group.deleteMany({ createdBy: { $in: oldUserIds } });
    await User.deleteMany({ email: { $in: emails } });
    console.log("🗑️  Cleaned old seed data");

    // Create users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("demo1234", salt);

    const createdUsers = await User.insertMany(
      users.map((u) => ({
        ...u,
        password: hashedPassword,
        isVerified: true,
      }))
    );
    console.log(`👥 Created ${createdUsers.length} users`);

    // Create DM messages between pairs
    const messageDocs = [];
    for (let i = 0; i < createdUsers.length; i++) {
      for (let j = i + 1; j < Math.min(i + 4, createdUsers.length); j++) {
        const count = Math.floor(Math.random() * 5) + 3;
        for (let k = 0; k < count; k++) {
          const isSenderFirst = k % 2 === 0;
          const sender = isSenderFirst ? createdUsers[i] : createdUsers[j];
          const receiver = isSenderFirst ? createdUsers[j] : createdUsers[i];
          messageDocs.push({
            senderId: sender._id,
            receiverId: receiver._id,
            text: randomFrom(sampleMessages),
            messageType: "text",
            readBy: [sender._id],
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
          });
        }
      }
    }
    await Message.insertMany(messageDocs);
    console.log(`💬 Created ${messageDocs.length} DM messages`);

    // Create groups
    for (const gData of groupData) {
      const memberCount = Math.floor(Math.random() * 4) + 3;
      const shuffled = [...createdUsers].sort(() => Math.random() - 0.5);
      const members = shuffled.slice(0, memberCount);
      const admin = members[0];

      const group = await Group.create({
        ...gData,
        createdBy: admin._id,
        members: members.map((m) => m._id),
        admins: [admin._id],
        groupPic: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(gData.name)}`,
      });

      // Group messages
      const groupMsgs = [];
      for (let i = 0; i < 8; i++) {
        const sender = randomFrom(members);
        groupMsgs.push({
          senderId: sender._id,
          groupId: group._id,
          text: randomFrom(sampleMessages),
          messageType: "text",
          readBy: [sender._id],
          createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        });
      }
      const savedMsgs = await Message.insertMany(groupMsgs);
      await Group.findByIdAndUpdate(group._id, {
        lastMessage: savedMsgs[savedMsgs.length - 1]._id,
      });
    }
    console.log(`👥 Created ${groupData.length} groups with messages`);

    console.log("\n🌱 Seed completed successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  Demo Credentials (password: demo1234 for all):");
    users.forEach((u) => console.log(`  📧 ${u.email}`));
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
