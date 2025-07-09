import firestore from '@react-native-firebase/firestore';
import { Group, GroupMember, User } from '@/types';
import { notificationService } from './notificationService';

class GroupsService {
  async createGroup(name: string, description: string = '', userId: string): Promise<Group> {
    try {
      const userDoc = await firestore().collection('users').doc(userId).get();
      const userData = userDoc.data() as User;
      
      const groupData: Omit<Group, 'id'> = {
        name,
        description,
        members: [{
          userId,
          displayName: userData.displayName,
          email: userData.email,
          photoURL: userData.photoURL,
          joinedAt: new Date(),
          role: 'admin',
        }],
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      const docRef = await firestore().collection('groups').add(groupData);
      
      return {
        id: docRef.id,
        ...groupData,
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getUserGroups(userId: string): Promise<Group[]> {
    try {
      const snapshot = await firestore()
        .collection('groups')
        .where('members', 'array-contains-any', [{ userId }])
        .orderBy('updatedAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Group[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async addMemberToGroup(groupId: string, email: string): Promise<{ groupId: string; member: GroupMember }> {
    try {
      const userSnapshot = await firestore()
        .collection('users')
        .where('email', '==', email)
        .get();

      if (userSnapshot.empty) {
        throw new Error('User not found with this email');
      }

      const userData = userSnapshot.docs[0].data() as User;
      const newMember: GroupMember = {
        userId: userData.id,
        displayName: userData.displayName,
        email: userData.email,
        photoURL: userData.photoURL,
        joinedAt: new Date(),
        role: 'member',
      };

      await firestore()
        .collection('groups')
        .doc(groupId)
        .update({
          members: firestore.FieldValue.arrayUnion(newMember),
          updatedAt: new Date(),
        });

      await notificationService.sendNotification(userData.id, {
        type: 'member_added',
        title: 'Added to Group',
        message: 'You have been added to a new expense group',
        data: { groupId },
      });

      return { groupId, member: newMember };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async removeMemberFromGroup(groupId: string, userId: string): Promise<{ groupId: string; userId: string }> {
    try {
      const groupDoc = await firestore().collection('groups').doc(groupId).get();
      const groupData = groupDoc.data() as Group;
      
      const updatedMembers = groupData.members.filter(member => member.userId !== userId);
      
      await firestore()
        .collection('groups')
        .doc(groupId)
        .update({
          members: updatedMembers,
          updatedAt: new Date(),
        });

      return { groupId, userId };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async updateGroup(groupId: string, updates: Partial<Group>): Promise<Group> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      await firestore()
        .collection('groups')
        .doc(groupId)
        .update(updateData);

      const updatedDoc = await firestore()
        .collection('groups')
        .doc(groupId)
        .get();

      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      } as Group;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async deleteGroup(groupId: string): Promise<void> {
    try {
      await firestore()
        .collection('groups')
        .doc(groupId)
        .update({
          isActive: false,
          updatedAt: new Date(),
        });

      const groupDoc = await firestore().collection('groups').doc(groupId).get();
      const groupData = groupDoc.data() as Group;

      for (const member of groupData.members) {
        await notificationService.sendNotification(member.userId, {
          type: 'group_closed',
          title: 'Group Closed',
          message: `The group "${groupData.name}" has been closed`,
          data: { groupId },
        });
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

export const groupsService = new GroupsService();