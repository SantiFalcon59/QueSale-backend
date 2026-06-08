/**
 * Migrate existing UserWallPost records into the unified Post model.
 * Run: node scripts/migrateWallPosts.js
 */
import prisma from '../src/config/prisma.js';

async function migrate() {
  console.log('Starting UserWallPost → Post migration...');

  const wallPosts = await prisma.userWallPost.findMany({
    include: {
      comments: true,
      likes: true,
    },
  });

  console.log(`Found ${wallPosts.length} wall posts to migrate`);

  let postType = await prisma.postType.findUnique({ where: { name: 'comment' } });
  if (!postType) {
    postType = await prisma.postType.create({ data: { name: 'comment' } });
  }

  for (const wp of wallPosts) {
    const existing = await prisma.post.findFirst({
      where: {
        wall_type: 'user_profile',
        wall_id: wp.id_profile_user,
        content: wp.content,
        id_user: wp.id_author_user,
      },
    });

    if (existing) {
      console.log(`  Skipping already migrated post ${wp.id_post}`);
      continue;
    }

    const post = await prisma.post.create({
      data: {
        wall_type: 'user_profile',
        wall_id: wp.id_profile_user,
        content: wp.content,
        id_user: wp.id_author_user,
        id_post_type: postType.id_post_type,
        likes_count: wp.likes_count,
        created_at: wp.created_at,
        updated_at: wp.updated_at,
      },
    });

    // Migrate comments
    for (const comment of wp.comments) {
      await prisma.comment.create({
        data: {
          id_post: post.id_post,
          id_user: comment.id_author_user,
          content: comment.content,
          likes_count: comment.likes_count,
          created_at: comment.created_at,
        },
      });
    }

    // Migrate likes
    for (const like of wp.likes) {
      await prisma.postLike.create({
        data: {
          id_post: post.id_post,
          id_user: like.id_user,
          created_at: like.created_at,
        },
      });
    }

    console.log(`  Migrated post ${wp.id_post} → post ${post.id_post}`);
  }

  console.log('Migration complete!');
  await prisma.$disconnect();
}

migrate().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});
