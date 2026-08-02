import { Request, Response } from 'express';
import { db } from '../config/db';

export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const messages = db.messages.filter((m) => m.sender_id === userId || m.receiver_id === userId);
    messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const unreadCount = db.messages.filter((m) => m.receiver_id === userId && !m.is_read).length;

    res.json({ success: true, data: messages, unreadCount });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const senderId = (req as any).user?.id;
    const { receiverId, subject, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ success: false, message: 'Receiver and content are required' });
    }

    const senderUser = db.users.find((u) => u.id === senderId);
    const receiverUser = db.users.find((u) => u.id === Number(receiverId));

    const senderEmp = db.employees.find((e) => e.user_id === senderId);
    const receiverEmp = db.employees.find((e) => e.user_id === Number(receiverId));

    const senderName = senderEmp ? `${senderEmp.first_name} ${senderEmp.last_name}` : senderUser?.email || 'User';
    const receiverName = receiverEmp ? `${receiverEmp.first_name} ${receiverEmp.last_name}` : receiverUser?.email || 'User';

    const newMessage = {
      id: db.messages.length + 1,
      sender_id: senderId,
      receiver_id: Number(receiverId),
      sender_name: senderName,
      receiver_name: receiverName,
      subject: subject || 'No Subject',
      content,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    db.messages.push(newMessage);

    // Add in-app notification
    db.notifications.push({
      id: db.notifications.length + 1,
      user_id: Number(receiverId),
      title: 'New Message Received',
      message: `${senderName} sent you a message: "${subject || content.substring(0, 30)}..."`,
      type: 'Manager Message',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    res.json({ success: true, data: newMessage, message: 'Message sent successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markMessageRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const msg = db.messages.find((m) => m.id === Number(id));
    if (msg) {
      msg.is_read = true;
    }
    res.json({ success: true, message: 'Marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
