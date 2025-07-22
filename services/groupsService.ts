import { Group, GroupMember, User } from '@/types';
import firestore from '@react-native-firebase/firestore';
import { notificationService } from './notificationService';

class GroupsService {
  async createGroup(
    name: string,
    description: string = '',
    userId: string,
    memberEmails: string[] = []
  ): Promise<Group> {
    const batch = firestore().batch();
    try {
      const userDoc = await firestore().collection('users').doc(userId).get();
      const userData = userDoc.data() as User | undefined;

      if (!userData) {
        throw new Error('User data not found');
      }

      const groupData: Omit<Group, 'id'> = {
        name,
        description,
        members: [
          {
            userId,
            displayName: userData.displayName || 'Unknown',
            email: userData.email || '',
            photoURL: userData.photoURL || null,
            joinedAt: new Date(),
            role: 'admin',
          },
        ],
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      const groupRef = firestore().collection('groups').doc();
      batch.set(groupRef, groupData);

      // Add multiple members in batch
      if (memberEmails.length > 0) {
        const newMembers = await this.addMultipleMembersToGroup(
          groupRef.id,
          memberEmails,
          true
        );
        groupData.members.push(...newMembers);
      }

      await batch.commit();

      return {
        id: groupRef.id,
        ...groupData,
      };
    } catch (error: any) {
      throw new Error(`Failed to create group: ${error.message}`);
    }
  }

  async getUserGroups(userId: string): Promise<Group[]> {
    try {
      const snapshot = await firestore()
        .collection('groups')
        .where('members.userId', 'array-contains', userId)
        .orderBy('updatedAt', 'desc')
        .limit(50) // Limit to prevent excessive data fetching
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Group[];
    } catch (error: any) {
      throw new Error(`Failed to fetch groups: ${error.message}`);
    }
  }

  async addMultipleMembersToGroup(
    groupId: string,
    emails: string[],
    isBatch = false
  ): Promise<GroupMember[]> {
    try {
      const batch = isBatch ? null : firestore().batch();
      const groupRef = firestore().collection('groups').doc(groupId);
      const newMembers: GroupMember[] = [];
      const existingMembers = (await groupRef.get()).data()?.members || [];
      const existingEmails = new Set(
        existingMembers.map((m: GroupMember) => m.email)
      );

      for (const email of emails) {
        if (existingEmails.has(email)) continue;

        const userSnapshot = await firestore()
          .collection('users')
          .where('email', '==', email)
          .limit(1)
          .get();

        if (userSnapshot.empty) {
          console.warn(`User not found for email: ${email}`);
          continue;
        }

        const userData = userSnapshot.docs[0].data() as User;
        const newMember: GroupMember = {
          userId: userData.id,
          displayName: userData.displayName || 'Unknown',
          email: userData.email || '',
          photoURL: userData.photoURL || null,
          joinedAt: new Date(),
          role: 'member',
        };

        newMembers.push(newMember);
        existingEmails.add(email);

        if (!isBatch) {
          batch!.update(groupRef, {
            members: firestore.FieldValue.arrayUnion(newMember),
            updatedAt: new Date(),
          });

          await notificationService.sendNotification(userData.id, {
            type: 'member_added',
            title: 'Added to Group',
            message: 'You have been added to a new expense group',
            data: { groupId },
          });
        }
      }

      if (!isBatch && newMembers.length > 0) {
        await batch!.commit();
      }

      return newMembers;
    } catch (error: any) {
      throw new Error(`Failed to add members: ${error.message}`);
    }
  }

  async addMemberToGroup(
    groupId: string,
    email: string
  ): Promise<{ groupId: string; member: GroupMember }> {
    const members = await this.addMultipleMembersToGroup(groupId, [email]);
    if (members.length === 0) {
      throw new Error('No valid members added');
    }
    return { groupId, member: members[0] };
  }

  async removeMemberFromGroup(
    groupId: string,
    userId: string
  ): Promise<{ groupId: string; userId: string }> {
    try {
      const groupRef = firestore().collection('groups').doc(groupId);
      const groupDoc = await groupRef.get();
      const groupData = groupDoc.data() as Group;

      const updatedMembers = groupData.members.filter(
        (member) => member.userId !== userId
      );

      await groupRef.update({
        members: updatedMembers,
        updatedAt: new Date(),
      });

      return { groupId, userId };
    } catch (error: any) {
      throw new Error(`Failed to remove member: ${error.message}`);
    }
  }

  async updateGroup(groupId: string, updates: Partial<Group>): Promise<Group> {
    try {
      const groupRef = firestore().collection('groups').doc(groupId);
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      await groupRef.update(updateData);
      const updatedDoc = await groupRef.get();

      return {
        id: groupId,
        ...updatedDoc.data(),
      } as Group;
    } catch (error: any) {
      throw new Error(`Failed to update group: ${error.message}`);
    }
  }

  async deleteGroup(groupId: string): Promise<void> {
    try {
      const groupRef = firestore().collection('groups').doc(groupId);
      const groupDoc = await groupRef.get();
      const groupData = groupDoc.data() as Group;

      await groupRef.update({
        isActive: false,
        updatedAt: new Date(),
      });

      const batch = firestore().batch();
      for (const member of groupData.members) {
        await notificationService.sendNotification(member.userId, {
          type: 'group_closed',
          title: 'Group Closed',
          message: `The group "${groupData.name}" has been closed`,
          data: { groupId },
        });
      }
    } catch (error: any) {
      throw new Error(`Failed to delete group: ${error.message}`);
    }
  }
}

export const groupsService = new GroupsService();
