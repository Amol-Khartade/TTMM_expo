import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  arrayUnion,
} from '@react-native-firebase/firestore';
import { Group, GroupMember, User } from '@/types';
import { notificationService } from './notificationService';
import { sanitizeForFirestore } from '@/utils/firestoreUtils';
import { sortByDateDesc } from '@/utils/formatters';

class GroupsService {
  async createGroup(name: string, description: string = '', userId: string): Promise<Group> {
    try {
      const db = getFirestore();
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? (userDoc.data() as User) : null;

      const adminMember: GroupMember = {
        userId,
        displayName: userData?.displayName || 'Admin',
        email: userData?.email || '',
        joinedAt: new Date(),
        role: 'admin',
        ...(userData?.photoURL ? { photoURL: userData.photoURL } : {}),
      };

      const groupData: Omit<Group, 'id'> = {
        name: name.trim(),
        description: description?.trim() || '',
        members: [adminMember],
        memberIds: [userId],
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      const cleanGroupData = sanitizeForFirestore(groupData);
      const groupsColRef = collection(db, 'groups');
      const docRef = await addDoc(groupsColRef, cleanGroupData);

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
      const db = getFirestore();
      const groupsColRef = collection(db, 'groups');

      // Query by memberIds and createdBy as a fallback for legacy documents
      const memberQuery = query(groupsColRef, where('memberIds', 'array-contains', userId));
      const creatorQuery = query(groupsColRef, where('createdBy', '==', userId));

      const [memberSnap, creatorSnap] = await Promise.all([
        getDocs(memberQuery),
        getDocs(creatorQuery),
      ]);

      const groupsMap = new Map<string, Group>();

      const processDoc = (d: any) => {
        const data = d.data();
        if (data.isActive !== false) {
          groupsMap.set(d.id, {
            id: d.id,
            ...data,
          } as Group);
        }
      };

      memberSnap.docs.forEach(processDoc);
      creatorSnap.docs.forEach(processDoc);

      const groups = Array.from(groupsMap.values());
      return sortByDateDesc(groups, (g) => g.updatedAt);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async addMemberToGroup(groupId: string, email: string): Promise<{ groupId: string; member: GroupMember }> {
    try {
      const db = getFirestore();
      const usersColRef = collection(db, 'users');
      const userSnapshot = await getDocs(query(usersColRef, where('email', '==', email)));

      if (userSnapshot.empty) {
        throw new Error('User not found with this email');
      }

      const userData = userSnapshot.docs[0].data() as User;
      const newMember: GroupMember = {
        userId: userData.id,
        displayName: userData.displayName || '',
        email: userData.email || '',
        joinedAt: new Date(),
        role: 'member',
        ...(userData.photoURL ? { photoURL: userData.photoURL } : {}),
      };

      const groupDocRef = doc(db, 'groups', groupId);
      await updateDoc(groupDocRef, {
        members: arrayUnion(sanitizeForFirestore(newMember)),
        memberIds: arrayUnion(userData.id),
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
      const db = getFirestore();
      const groupDocRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupDocRef);
      const groupData = groupDoc.data() as Group;

      const updatedMembers = (groupData.members || []).filter(member => member.userId !== userId);
      const updatedMemberIds = updatedMembers.map(member => member.userId);

      await updateDoc(groupDocRef, {
        members: updatedMembers,
        memberIds: updatedMemberIds,
        updatedAt: new Date(),
      });

      return { groupId, userId };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async updateGroup(groupId: string, updates: Partial<Group>): Promise<Group> {
    try {
      const db = getFirestore();
      const groupDocRef = doc(db, 'groups', groupId);

      const updateData = sanitizeForFirestore({
        ...updates,
        updatedAt: new Date(),
      });

      await updateDoc(groupDocRef, updateData);

      const updatedDoc = await getDoc(groupDocRef);

      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      } as Group;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getGroupDetails(groupId: string): Promise<Group> {
    try {
      const db = getFirestore();
      const groupDocRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupDocRef);

      if (!groupDoc.exists()) {
        throw new Error('Group not found');
      }

      return {
        id: groupDoc.id,
        ...groupDoc.data(),
      } as Group;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async deleteGroup(groupId: string): Promise<void> {
    try {
      const db = getFirestore();
      const groupDocRef = doc(db, 'groups', groupId);

      await updateDoc(groupDocRef, {
        isActive: false,
        updatedAt: new Date(),
      });

      const groupDoc = await getDoc(groupDocRef);
      const groupData = groupDoc.data() as Group;

      if (groupData?.members) {
        for (const member of groupData.members) {
          await notificationService.sendNotification(member.userId, {
            type: 'group_closed',
            title: 'Group Closed',
            message: `The group "${groupData.name}" has been closed`,
            data: { groupId },
          });
        }
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

export const groupsService = new GroupsService();