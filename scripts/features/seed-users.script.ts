import { adminDb, getServerFirebaseAuth } from '../../src/services/firebase/firebase.server';
import { BaseScript } from '../core/base.script';
import { fileURLToPath } from 'node:url';
import { USER_TEMPLATES } from '../data/user.templates';

export class SeedUsersScript extends BaseScript {
  name = 'Seed Users';

  async run(): Promise<void> {
    await this.ensureReady();
    this.log('Seeding users...');

    const auth = getServerFirebaseAuth();
    let created = 0;
    let skipped = 0;

    for (const template of USER_TEMPLATES) {
      try {
        let userRecord;
        try {
          userRecord = await auth.getUserByEmail(template.email);
          this.log(`User already exists in Auth: ${template.email}`);
        } catch {
          userRecord = await auth.createUser({
            email: template.email,
            password: 'Test@123456',
            displayName: template.name,
            photoURL: template.avatarUrl,
          });
          this.log(`Created Auth user: ${template.email}`);
        }

        const userDoc = await adminDb.collection('users').doc(userRecord.uid).get();

        if (userDoc.exists) {
          this.log(`User already exists in Firestore: ${template.username}`);
          skipped++;
          continue;
        }

        const now = Date.now();
        await adminDb.collection('users').doc(userRecord.uid).set({
          username: template.username,
          name: template.name,
          email: template.email,
          avatarUrl: template.avatarUrl || null,
          bio: template.bio,
          createdAt: now,
          updatedAt: now,
        });

        this.log(`✓ Created user: ${template.name} (@${template.username})`);
        created++;
      } catch (error: any) {
        this.logError(`Failed to create user ${template.email}: ${error.message}`);
      }
    }

    this.logSuccess(`Seeded ${created} users, skipped ${skipped} existing users`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  new SeedUsersScript()
    .run()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
